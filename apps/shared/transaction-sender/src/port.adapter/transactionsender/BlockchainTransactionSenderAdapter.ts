// SPDX-License-Identifier: Apache-2.0

import { BlockchainTransactionSenderPort } from "./BlockchainTransactionSenderPort"
import { SignedTransactionMessage } from "../../domain/model/SignedTransactionMessage"
import { Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class BlockchainTransactionSenderAdapter implements BlockchainTransactionSenderPort {
  async sendTransaction(signedTransaction: SignedTransactionMessage): Promise<string> {
    if (signedTransaction.format === "hedera") {
      return await this.sendHederaTransaction(signedTransaction)
    } else {
      return await this.sendEthereumTransaction(signedTransaction)
    }
  }

  private sendHederaTransaction(signedTransaction: SignedTransactionMessage): Promise<string> {
    //TODO: Implement Hedera SDK integration
    const dummyHash = `hedera_${signedTransaction.format}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return Promise.resolve(dummyHash)
  }

  private sendEthereumTransaction(signedTransaction: SignedTransactionMessage): Promise<string> {
    // TODO: Implement ethers.js integration
    const dummyHash = `ethereum_${signedTransaction.format}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return Promise.resolve(dummyHash)
  }
}
