// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"

export class ClearingRedeemCreatedEvent extends Event {
  constructor(public readonly clearing: ClearingRedeem) {
    super()
  }
}
