// SPDX-License-Identifier: Apache-2.0

import { Client, Transaction, Status } from "@hashgraph/sdk"
import { ethers } from "ethers"
import { Logger } from "@nestjs/common"
import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"
import { BlockchainTransactionResponse } from "@domain/model/BlockchainTransactionResponse"
import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { TransactionSenderConfigService } from "../../config/TransactionSenderConfigService"

@Singleton()
export class BlockchainTransactionSenderAdapter implements BlockchainTransactionSenderPort {
  private readonly logger = new Logger(BlockchainTransactionSenderAdapter.name)

  constructor(private readonly configService: TransactionSenderConfigService) {}
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
        this.logger.error(
          `Hedera transaction receipt error for ${response.transactionId.toString()}: ${errorCode}`,
          receiptError.stack,
        )
        return {
          transactionId: response.transactionId.toString(),
          status: "failed",
          errorCode: errorCode,
        }
      }
    } catch (executionError: any) {
      const errorCode = executionError.status
        ? Status[executionError.status] || executionError.status.toString()
        : "EXECUTION_ERROR"
      this.logger.error(`Hedera transaction execution error: ${errorCode}`, executionError.stack)
      return {
        transactionId: "EXECUTION_FAILED",
        status: "failed",
        errorCode: errorCode,
      }
    } finally {
      client.close()
    }
  }

  private createHederaClient(): Client {
    const network = this.configService.getHederaNetwork()
    
    switch (network.toLowerCase()) {
      case "mainnet":
        return Client.forMainnet()
      case "previewnet":
        return Client.forPreviewnet()
      case "local":
        return Client.forNetwork({ "127.0.0.1:50211": "0.0.3" })
      case "testnet":
      default:
        return Client.forTestnet()
    }
  }

  private getEthereumRpcUrl(): string {
    const network = this.configService.getEthereumNetwork()
    
    switch (network.toLowerCase()) {
      case "mainnet":
        return "https://mainnet.hashio.io/api"
      case "previewnet":
        return "https://previewnet.hashio.io/api"
      case "local":
        return "http://localhost:8545"
      case "testnet":
      default:
        return "https://testnet.hashio.io/api"
    }
  }

  private async sendEthereumTransaction(
    signedTransaction: SignedTransactionRequest,
  ): Promise<BlockchainTransactionResponse> {
    const rpcUrl = this.getEthereumRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    try {
      const txResponse = await provider.sendTransaction(signedTransaction.payload)
      const receipt = await txResponse.wait()

      if (receipt.status === 1) {
        return {
          transactionId: receipt.transactionHash,
          status: "success",
        }
      } else {
        this.logger.error(`Ethereum transaction failed: ${receipt.transactionHash} - CALL_EXCEPTION`)
        return {
          transactionId: receipt.transactionHash,
          status: "failed",
          errorCode: "CALL_EXCEPTION",
        }
      }
    } catch (error: any) {
      const errorCode = error.code || "UNKNOWN_ERROR"
      const transactionId = error.transactionHash || "EXECUTION_FAILED"
      this.logger.error(`Ethereum transaction execution error: ${errorCode}`, error.stack)
      return {
        transactionId: transactionId,
        status: "failed",
        errorCode: errorCode,
      }
    }
  }
}
