// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class ProceedsRecipientCreatedEvent extends Event {
  constructor(
    readonly proceedsRecipientId: string,
    readonly contractId: string,
    readonly treasuryId: string,
  ) {
    super()
  }
}
