// SPDX-License-Identifier: Apache-2.0

export interface TransactionResponse {
  transactionId: string
  status: "success" | "failed"
  errorCode?: string
}
