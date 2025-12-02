// SPDX-License-Identifier: Apache-2.0

import { BaseRepository, Singleton } from "@hashgraph/green-bonds-shared-core"
import { EventStorePersistence } from "@port/persistence/eventstore/model/EventStorePersistence"
import { EventStoreRepository } from "@domain/eventstore/repositories/EventStoreRepository"
import { EventStore } from "@domain/eventstore/model/EventStore"

@Singleton()
export class EventStoreTypeOrmRepository extends BaseRepository<EventStorePersistence> implements EventStoreRepository {
  constructor() {
    super(EventStorePersistence)
  }

  async save(eventStore: EventStore, transactionId: string): Promise<EventStore> {
    const persistence = await this.getRepository(transactionId).save(eventStore as EventStorePersistence)
    return persistence as EventStore
  }
}
