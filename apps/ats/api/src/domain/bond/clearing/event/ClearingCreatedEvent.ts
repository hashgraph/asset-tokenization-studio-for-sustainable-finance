// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import { ClearingRedeem } from "@domain/bond/clearing/model/ClearingRedeem"
import { ClearingTransfer } from "@domain/bond/clearing/model/ClearingTransfer"

export class ClearingCreatedEvent extends Event {
  constructor(public readonly clearing: ClearingHold | ClearingRedeem | ClearingTransfer) {
    super()
  }
}
