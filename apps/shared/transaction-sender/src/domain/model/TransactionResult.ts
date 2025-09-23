// SPDX-License-Identifier: Apache-2.0

export interface TransactionResult {
  transactionId: string
  status: "success" | "failed"
  errorCode?: string
}
