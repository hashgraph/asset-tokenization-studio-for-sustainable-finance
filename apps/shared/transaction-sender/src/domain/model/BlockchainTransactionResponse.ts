// SPDX-License-Identifier: Apache-2.0

export interface BlockchainTransactionResponse {
  transactionId: string
  status: "success" | "failed"
  errorCode?: string
}
