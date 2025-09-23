// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"
import { TransactionResponse } from "@domain/model/TransactionResponse"

export interface BlockchainTransactionSenderPort {
  sendTransaction(signedTransaction: SignedTransactionRequest): Promise<TransactionResponse>
}
