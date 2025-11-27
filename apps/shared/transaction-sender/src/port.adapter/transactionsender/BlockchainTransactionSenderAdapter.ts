// SPDX-License-Identifier: Apache-2.0

import { Client, Transaction, Status } from "@hashgraph/sdk"
import { ethers } from "ethers"
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
    shouldNotRetry: (error: Error) => {
      if (error instanceof BlockchainError) {
        return !error.isTransient
      }
      return false
    },
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

        throw new BlockchainError(
          `Hedera receipt error: ${errorCode}`,
          errorCode,
          transactionId,
          isTransient,
        )
      }
    } catch (executionError: any) {
      if (executionError instanceof BlockchainError) {
        throw executionError
      }

      const errorCode = executionError.status
        ? Status[executionError.status] || executionError.status.toString()
        : "EXECUTION_ERROR"
      const isTransient = this.isHederaErrorTransient(errorCode)

      this.logger.error(
        `Hedera transaction execution error: ${errorCode} (transient: ${isTransient})`,
        executionError,
      )

      throw new BlockchainError(
        `Hedera execution error: ${errorCode}`,
        errorCode,
        "EXECUTION_FAILED",
        isTransient,
      )
    } finally {
      client.close()
    }
  }
  private createHederaClient(): Client {
    const network = this.configService.getNetwork() as NetworkEnvironment
    return getHederaClient(network)
  }

  private getEthereumProvider(): ethers.providers.JsonRpcProvider {
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
        `Ethereum transaction execution error: ${errorCode}${httpStatusCode ? ` (HTTP ${httpStatusCode})` : ""} (transient: ${isTransient})`,
        error,
      )

      throw new BlockchainError(
        `Ethereum execution error: ${errorCode}`,
        errorCode,
        transactionId,
        isTransient,
      )
    }
  }

  /**
   * Determines if a Hedera error is transient (should be retried).
   * 
   * Philosophy: Only retry infrastructure/network errors (server-side, 5xx-like).
   * Never retry validation/business logic errors (client-side, 4xx-like).
   * Default conservatively to NOT retry unknown errors.
   */
  private isHederaErrorTransient(errorCode: string): boolean {
    // Infrastructure errors (5xx-like) - retry these
    const serverErrors = [
      "TIMEOUT",                          // Network timeout
      "BUSY",                             // Node is busy
      "PLATFORM_TRANSACTION_NOT_CREATED", // Temporary platform issue
      "PLATFORM_NOT_ACTIVE",              // Platform temporarily down
      "RECEIPT_NOT_FOUND",                // Temporary receipt lookup issue
      "CONSENSUS_GAS_EXHAUSTED"           // Could be network issue
    ]

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
      "CONTRACT_REVERT_EXECUTION",
    ]

    if (clientErrors.includes(errorCode)) {
      return false
    }

    if (serverErrors.includes(errorCode)) {
      return true
    }
    // Unknown error: conservative approach - don't retry
    return false
  }

  /**
   * Determines if an Ethereum error is transient (should be retried).
   * 
   * Strategy: Use HTTP status codes when available (more reliable),
   * fallback to error code strings for non-HTTP errors.
   * 
   * HTTP codes:
   * - 4xx (client errors): validation/user errors → do NOT retry
   * - 5xx (server errors): infrastructure errors → DO retry
   * - 429 (rate limit): special case → DO retry with backoff
   */
  private isEthereumErrorTransient(errorCode: string, httpStatusCode?: number): boolean {
    if (httpStatusCode !== undefined) {
      if (httpStatusCode >= 500 && httpStatusCode < 600) {
        return true
      }

      if (httpStatusCode === 429) {
        return true
      }
      if (httpStatusCode === 429) {
        return true
      }
      if (httpStatusCode === 408) {
        return true
      }
      if (httpStatusCode >= 400 && httpStatusCode < 500) {
        return false
      }
      return false
    }

    const serverErrors = [
      "NETWORK_ERROR",              // Network connectivity issue
      "TIMEOUT",                    // Request timeout
      "SERVER_ERROR",               // RPC server error              // Could be network issue
      "CONSENSUS_GAS_EXHAUSTED",    // Could be network issue
    ]

    // Validation errors (client-side, 4xx-like) - do NOT retry these
    const clientErrors = [
      "CONTRACT_REVERT_EXECUTION",  // Contract revert (business logic rejection)
      "CALL_EXCEPTION",             // Contract call failed
      "INSUFFICIENT_FUNDS",         // Not enough balance
      "NONCE_EXPIRED",              // Transaction nonce issue
      "REPLACEMENT_UNDERPRICED",    // Gas price too low
      "UNPREDICTABLE_GAS_LIMIT",    // Gas estimation failed
      "INVALID_ARGUMENT",
    ]

    if (clientErrors.includes(errorCode)) {
      return false
    }

    if (serverErrors.includes(errorCode)) {
      return true
    }

    if (typeof errorCode === "string" && errorCode.startsWith("-32")) {
      const code = parseInt(errorCode)
      if (code >= -32099 && code <= -32000) {
        return true
      }
    }

    // Unknown error: conservative approach - don't retry
    return false
  }
}
