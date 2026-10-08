// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"

export class EventProcessedEvent extends Event {
  constructor(
    readonly id: string,
    readonly eventName: string,
    readonly status: EventStoreStatus,
    readonly errorReason: string,
  ) {
    super()
  }
}
