// SPDX-License-Identifier: Apache-2.0

import { TransactionMetadata } from "../../domain/model/TransactionMetadata"

/**
 * Port interface for publishing transaction results to outgoing queues.
 * This port abstracts the infrastructure details of message publishing
 * and focuses on the business capability of notifying about transaction results.
 */
export interface PublishTransactionResultPort {
  publishResult(result: TransactionResult): Promise<void>
}

export interface TransactionResult {
  payload: string
  metadata: TransactionMetadata
  format: string
  transactionHash?: string
}
