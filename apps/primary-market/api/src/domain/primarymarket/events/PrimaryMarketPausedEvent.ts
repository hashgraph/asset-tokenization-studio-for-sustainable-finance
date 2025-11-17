// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketPausedEvent extends Event {
  constructor(public readonly contractId: string) {
    super()
  }
}
