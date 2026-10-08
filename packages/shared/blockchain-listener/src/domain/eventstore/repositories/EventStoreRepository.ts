// SPDX-License-Identifier: Apache-2.0

import { EventStore } from "@domain/eventstore/model/EventStore"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"

export interface EventStoreRepository {
  save(eventStore: EventStore, transactionId?: string): Promise<EventStore>

  existsByEventNameAndDataAndStatus(eventName: string, data: string, status: EventStoreStatus): Promise<boolean>
}
