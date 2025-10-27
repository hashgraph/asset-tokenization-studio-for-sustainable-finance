// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class ProceedsRecipientAllocationAddedEvent extends Event {
  constructor(
    readonly proceedsRecipientId: string,
    readonly amount: string,
  ) {
    super()
  }
}
