// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { Client, Transaction } from "@hashgraph/sdk"
import { ethers } from "ethers"
import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { SignedTransactionMessage } from "../../domain/model/SignedTransactionMessage"

@Injectable()
export class BlockchainTransactionSenderAdapter implements BlockchainTransactionSenderPort {
  async sendTransaction(signedTransaction: SignedTransactionMessage): Promise<string> {
    if (signedTransaction.format === "hedera") {
      return await this.sendHederaTransaction(signedTransaction)
    } else {
      return await this.sendEthereumTransaction(signedTransaction)
    }
  }

  private async sendHederaTransaction(signedTransaction: SignedTransactionMessage): Promise<string> {
    const client = Client.forTestnet()

    try {
      const transactionBytes = Buffer.from(signedTransaction.payload.replace("0x", ""), "hex")
      const transaction = Transaction.fromBytes(transactionBytes)

      const response = await transaction.execute(client)
      await response.getReceipt(client)

      return response.transactionId.toString()
    } finally {
      client.close()
    }
  }

  private async sendEthereumTransaction(signedTransaction: SignedTransactionMessage): Promise<string> {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || "https://testnet.hashio.io/api",
    )

    const txResponse = await provider.sendTransaction(signedTransaction.payload)
    const receipt = await txResponse.wait()

    return receipt.transactionHash
  }
}
