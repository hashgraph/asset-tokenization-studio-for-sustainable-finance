// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionMessage } from "../../domain/model/SignedTransactionMessage"

export interface BlockchainTransactionSenderPort {
  sendTransaction(signedTransaction: SignedTransactionMessage): Promise<string>
}
