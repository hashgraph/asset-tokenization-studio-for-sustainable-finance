// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionSentEvent } from "@domain/events/SignedTransactionSentEvent"

/**
 * Port for handling signed transaction sent events
 * This port defines the contract for adapters that listen to transaction events
 * and handle the publication of transaction results
 */
export interface PublishTransactionResultNestJSPort {
  handle(event: SignedTransactionSentEvent): Promise<void>
}
