// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"
import type { TransactionMetadata } from "@domain/model/TransactionMetadata"

export class TransactionResultPublishedEvent extends Event {
  constructor(
    public readonly payload: string,
    public readonly metadata: TransactionMetadata,
    public readonly format: string,
    public readonly transactionHash: string,
    public readonly status: string,
    public readonly errorCode?: string,
  ) {
    super()
  }
}
