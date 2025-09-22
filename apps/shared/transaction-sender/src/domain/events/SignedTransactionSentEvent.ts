// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"
import { TransactionMetadata } from "../model/TransactionMetadata"

export class SignedTransactionSentEvent extends Event {
  constructor(
    public readonly payload: string,
    public readonly metadata: TransactionMetadata,
    public readonly format: string,
    public readonly transactionHash?: string,
  ) {
    super()
  }
}
