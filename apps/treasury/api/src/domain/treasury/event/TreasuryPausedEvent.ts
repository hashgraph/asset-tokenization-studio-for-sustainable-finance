// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class TreasuryPausedEvent extends Event {
  treasuryContractId: string

  constructor(treasuryContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
  }
}
