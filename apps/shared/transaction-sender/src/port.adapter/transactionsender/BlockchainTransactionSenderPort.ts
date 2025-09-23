// SPDX-License-Identifier: Apache-2.0

import { BlockchainTransactionResponse } from "@domain/model/BlockchainTransactionResponse"
import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"

export interface BlockchainTransactionSenderPort {
  sendTransaction(signedTransaction: SignedTransactionRequest): Promise<BlockchainTransactionResponse>
}
