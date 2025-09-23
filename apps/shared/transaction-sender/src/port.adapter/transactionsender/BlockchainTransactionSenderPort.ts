// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionMessage } from "@domain/model/SignedTransactionMessage"
import { TransactionResult } from "@domain/model/TransactionResult"

export interface BlockchainTransactionSenderPort {
  sendTransaction(signedTransaction: SignedTransactionMessage): Promise<TransactionResult>
}
