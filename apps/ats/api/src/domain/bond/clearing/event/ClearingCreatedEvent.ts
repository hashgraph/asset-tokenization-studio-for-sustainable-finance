// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"

export class ClearingCreatedEvent extends Event {
  constructor(public readonly clearing: ClearingHold) {
    super()
  }
}
