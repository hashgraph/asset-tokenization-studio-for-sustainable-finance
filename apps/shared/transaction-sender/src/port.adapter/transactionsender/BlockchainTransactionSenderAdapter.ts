// SPDX-License-Identifier: Apache-2.0

import { Client, Transaction, Status } from "@hiero-ledger/sdk"
import { JsonRpcProvider } from "ethers"
import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { BlockchainTransactionResponse } from "@domain/model/BlockchainTransactionResponse"
import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"
import {
  Singleton,
  Logger,
  getEthereumProvider,
  getHederaClient,
  Environment as NetworkEnvironment,
  Retryable,
} from "@hashgraph/green-bonds-shared-core"
import { TransactionSenderConfigService } from "../../config/TransactionSenderConfigService"
import { BlockchainError } from "@domain/errors/BlockchainError"

@Singleton()
export class BlockchainTransactionSenderAdapter implements BlockchainTransactionSenderPort {
  private readonly logger = new Logger(BlockchainTransactionSenderAdapter.name)

  constructor(private readonly configService: TransactionSenderConfigService) {}

  @Retryable({
    retries: parseInt(process.env.TX_RETRY_ATTEMPTS || "3", 10),
    minTimeout: parseInt(process.env.TX_RETRY_MIN_TIMEOUT || "5000", 10),
    maxTimeout: parseInt(process.env.TX_RETRY_MAX_TIMEOUT || "20000", 10),
    factor: parseFloat(process.env.TX_RETRY_FACTOR || "2"),
    shouldNotRetry: (error: Error) => error instanceof BlockchainError && !error.isTransient,
  })
  async sendTransaction(signedTransaction: SignedTransactionRequest): Promise<BlockchainTransactionResponse> {
    if (signedTransaction.format === "hedera") {
      return await this.sendHederaTransaction(signedTransaction)
    } else {
      return await this.sendEthereumTransaction(signedTransaction)
    }
  }

  private async sendHederaTransaction(
    signedTransaction: SignedTransactionRequest,
  ): Promise<BlockchainTransactionResponse> {
    const client = this.createHederaClient()

    try {
      const transactionBytes = Buffer.from(signedTransaction.payload.replace("0x", ""), "hex")
      const transaction = Transaction.fromBytes(transactionBytes)
      const response = await transaction.execute(client)

      try {
        await response.getReceipt(client)
        return {
          transactionId: response.transactionId.toString(),
          status: "success",
        }
      } catch (receiptError: any) {
        const errorCode = receiptError.status
          ? Status[receiptError.status] || receiptError.status.toString()
          : "UNKNOWN_ERROR"
        const transactionId = response.transactionId.toString()
        const isTransient = this.isHederaErrorTransient(errorCode)

        this.logger.error(
          `Hedera transaction receipt error for ${transactionId}: ${errorCode} (transient: ${isTransient})`,
          receiptError,
        )

        throw new BlockchainError(`Hedera receipt error: ${errorCode}`, errorCode, transactionId, isTransient)
      }
    } catch (executionError: any) {
      if (executionError instanceof BlockchainError) {
        throw executionError
      }

      const errorCode = executionError.status
        ? Status[executionError.status] || executionError.status.toString()
        : "EXECUTION_ERROR"
      const isTransient = this.isHederaErrorTransient(errorCode)

      this.logger.error(`Hedera transaction execution error: ${errorCode} (transient: ${isTransient})`, executionError)

      throw new BlockchainError(`Hedera execution error: ${errorCode}`, errorCode, "EXECUTION_FAILED", isTransient)
    } finally {
      client.close()
    }
  }
  private createHederaClient(): Client {
    const network = this.configService.getNetwork() as NetworkEnvironment
    return getHederaClient(network)
  }

  private getEthereumProvider(): JsonRpcProvider {
    const network = this.configService.getNetwork() as NetworkEnvironment
    return getEthereumProvider(network)
  }

  private async sendEthereumTransaction(
    signedTransaction: SignedTransactionRequest,
  ): Promise<BlockchainTransactionResponse> {
    const provider = this.getEthereumProvider()

    try {
      const txResponse = await provider.sendTransaction(signedTransaction.payload)
      const receipt = await txResponse.wait()

      if (receipt.status === 1) {
        return {
          transactionId: receipt.transactionHash,
          status: "success",
        }
      } else {
        const errorCode = "CONTRACT_REVERT_EXECUTION"
        const isTransient = false

        this.logger.error(
          `Ethereum transaction failed: ${receipt.transactionHash} - ${errorCode} (transient: ${isTransient})`,
        )

        throw new BlockchainError(
          `Ethereum transaction reverted: ${errorCode}`,
          errorCode,
          receipt.transactionHash,
          isTransient,
        )
      }
    } catch (error: any) {
      if (error instanceof BlockchainError) {
        throw error
      }

      const errorCode = error.code || "UNKNOWN_ERROR"
      const transactionId = error.transactionHash || "EXECUTION_FAILED"
      const httpStatusCode = error.response?.statusCode || error.statusCode
      const isTransient = this.isEthereumErrorTransient(errorCode, httpStatusCode)

      this.logger.error(
        "Ethereum transaction execution error: " +
          `${errorCode}${httpStatusCode ? ` (HTTP ${httpStatusCode})` : ""} (transient: ${isTransient})`,
        error,
      )

      throw new BlockchainError(`Ethereum execution error: ${errorCode}`, errorCode, transactionId, isTransient)
    }
  }

  /**
   * Determines if a Hedera error is transient (should be retried).
   *
   * Philosophy: Retry by default (optimistic approach).
   * Only explicitly avoid retrying known validation/business logic errors (client-side, 4xx-like).
   * Unknown errors are retried - better to retry and fail than miss a transient error.
   */
  private isHederaErrorTransient(errorCode: string): boolean {
    // Validation errors (4xx-like) - do NOT retry these
    const clientErrors = [
      "INSUFFICIENT_ACCOUNT_BALANCE",
      "INSUFFICIENT_TX_FEE",
      "INSUFFICIENT_PAYER_BALANCE",
      "INVALID_TRANSACTION",
      "INVALID_SIGNATURE",
      "INVALID_ACCOUNT_ID",
      "PAYER_ACCOUNT_NOT_FOUND",
      "ACCOUNT_DELETED",
      "UNAUTHORIZED",
      "CONTRACT_REVERT_EXECUTED",
    ]

    // Retry everything except known client errors
    return !clientErrors.includes(errorCode)
  }

  /**
   * Determines if an Ethereum error is transient (should be retried).
   *
   * Philosophy: Retry by default (optimistic approach).
   * Use HTTP status codes when available (most reliable).
   * For error codes, only explicitly avoid retrying known client errors.
   * Unknown errors are retried - better to retry and fail than miss a transient error.
   *
   * HTTP codes:
   * - 4xx (client errors): validation/user errors → do NOT retry
   * - 5xx (server errors): infrastructure errors → DO retry
   * - 429 (rate limit): special case → DO retry with backoff
   */
  private isEthereumErrorTransient(errorCode: string, httpStatusCode?: number): boolean {
    if (httpStatusCode !== undefined) {
      // Don't retry client errors (4xx), except rate limit (429) and timeout (408)
      if (httpStatusCode >= 400 && httpStatusCode < 500) {
        return httpStatusCode === 429 || httpStatusCode === 408
      }

      // Retry server errors (5xx) and unknown codes
      return true
    }

    // Validation errors (client-side, 4xx-like) - do NOT retry these
    const clientErrors = [
      "CONTRACT_REVERT_EXECUTED", // Contract revert (business logic rejection)
      "CALL_EXCEPTION", // Contract call failed
      "INSUFFICIENT_FUNDS", // Not enough balance
      "NONCE_EXPIRED", // Transaction nonce issue
      "REPLACEMENT_UNDERPRICED", // Gas price too low
      "UNPREDICTABLE_GAS_LIMIT", // Gas estimation failed
      "INVALID_ARGUMENT",
    ]

    // Retry everything except known client errors
    return !clientErrors.includes(errorCode)
  }
}
