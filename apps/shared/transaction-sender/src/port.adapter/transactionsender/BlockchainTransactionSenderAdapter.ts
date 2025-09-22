// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { Client, Transaction } from "@hashgraph/sdk"
import { ethers } from "ethers"
import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { SignedTransactionMessage } from "../../domain/model/SignedTransactionMessage"
import { TransactionResult } from "../../domain/model/TransactionResult"

@Injectable()
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
      } catch {
        return {
          transactionId: response.transactionId.toString(),
          status: "failed",
        }
      }
    } finally {
      client.close()
    }
  }

  private async sendEthereumTransaction(signedTransaction: SignedTransactionMessage): Promise<TransactionResult> {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || "https://testnet.hashio.io/api",
    )

    const txResponse = await provider.sendTransaction(signedTransaction.payload)
    const receipt = await txResponse.wait()

    return {
      transactionId: receipt.transactionHash,
      status: receipt.status === 1 ? "success" : "failed",
    }
  }
}
