// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class RedemptionHolderToSuccessSetEvent extends Event {
  constructor(
    readonly holderAccountId: string,
    readonly amount: string,
    readonly treasuryId: string,
  ) {
    super()
  }
}
