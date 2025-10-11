// SPDX-License-Identifier: Apache-2.0

import { TransactionMetadata } from "./TransactionMetadata"

export interface TransactionResult {
  payload: string
  metadata: TransactionMetadata
  format: string
  transactionHash: string
  status: "success" | "failed"
  errorCode?: string
}
