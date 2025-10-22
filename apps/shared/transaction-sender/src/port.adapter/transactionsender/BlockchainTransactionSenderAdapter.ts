// SPDX-License-Identifier: Apache-2.0

import { Client, Transaction, Status } from "@hashgraph/sdk"
import { ethers } from "ethers"
import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"
import { BlockchainTransactionResponse } from "@domain/model/BlockchainTransactionResponse"
import { Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class BlockchainTransactionSenderAdapter implements BlockchainTransactionSenderPort {
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
    const client = Client.forTestnet()

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
      return {
        transactionId: "EXECUTION_FAILED",
        status: "failed",
        errorCode: errorCode,
      }
    } finally {
      client.close()
    }
  }

  private async sendEthereumTransaction(
    signedTransaction: SignedTransactionRequest,
  ): Promise<BlockchainTransactionResponse> {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || "https://testnet.hashio.io/api",
    )

    try {
      const txResponse = await provider.sendTransaction(signedTransaction.payload)
      const receipt = await txResponse.wait()

      if (receipt.status === 1) {
        return {
          transactionId: receipt.transactionHash,
          status: "success",
        }
      } else {
        return {
          transactionId: receipt.transactionHash,
          status: "failed",
          errorCode: "CALL_EXCEPTION",
        }
      }
    } catch (error: any) {
      const errorCode = error.code || "UNKNOWN_ERROR"
      return {
        transactionId: error.transactionHash || "EXECUTION_FAILED",
        status: "failed",
        errorCode: errorCode,
      }
    }
  }
}
