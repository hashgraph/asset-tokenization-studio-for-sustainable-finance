// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class TreasuryCreatedEvent extends Event {
  constructor(readonly treasuryContractId: string) {
    super()
  }
}
