// SPDX-License-Identifier: Apache-2.0

import { EventStore } from "@domain/eventstore/model/EventStore"

export interface EventStoreRepository {
  save(eventStore: EventStore): Promise<EventStore>
}
