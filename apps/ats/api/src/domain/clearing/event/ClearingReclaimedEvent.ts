// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import { ClearingRedeem } from "../model/ClearingRedeem"

export class ClearingReclaimedEvent extends Event {
  constructor(public readonly clearing: ClearingHold | ClearingRedeem) {
    super()
  }
}
