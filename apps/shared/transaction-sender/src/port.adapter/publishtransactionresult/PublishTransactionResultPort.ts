// SPDX-License-Identifier: Apache-2.0

import { TransactionResult } from "@domain/model/TransactionResult"

/**
 * Port interface for publishing transaction results to outgoing queues.
 * This port abstracts the infrastructure details of message publishing
 * and focuses on the business capability of notifying about transaction results.
 */
export interface PublishTransactionResultPort {
  publishResult(result: TransactionResult): Promise<void>
}
