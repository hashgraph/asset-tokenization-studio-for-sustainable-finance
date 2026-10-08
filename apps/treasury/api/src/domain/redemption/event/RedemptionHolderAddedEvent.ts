// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class RedemptionHolderAddedEvent extends Event {
  constructor(
    readonly holderAccountId: string,
    readonly status: string,
    readonly amount: string | undefined,
    readonly treasuryId: string,
  ) {
    super()
  }
}
