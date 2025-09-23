// SPDX-License-Identifier: Apache-2.0

import { Client, Transaction, Status } from "@hashgraph/sdk"
import { ethers } from "ethers"
import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { SignedTransactionMessage } from "@domain/model/SignedTransactionMessage"
import { TransactionResult } from "@domain/model/TransactionResult"
import { Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class BlockchainTransactionSenderAdapter implements BlockchainTransactionSenderPort {
  async sendTransaction(signedTransaction: SignedTransactionMessage): Promise<TransactionResult> {
    if (signedTransaction.format === "hedera") {
      return await this.sendHederaTransaction(signedTransaction)
    } else {
      return await this.sendEthereumTransaction(signedTransaction)
    }
  }

  private async sendHederaTransaction(signedTransaction: SignedTransactionMessage): Promise<TransactionResult> {
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

  private async sendEthereumTransaction(signedTransaction: SignedTransactionMessage): Promise<TransactionResult> {
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
        transactionId: "EXECUTION_FAILED",
        status: "failed",
        errorCode: errorCode,
      }
    }
  }
}
