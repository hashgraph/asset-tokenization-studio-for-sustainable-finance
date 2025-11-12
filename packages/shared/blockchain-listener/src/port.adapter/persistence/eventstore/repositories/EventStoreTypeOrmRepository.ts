// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { EventStorePersistence } from "@port/persistence/eventstore/model/EventStorePersistence"
import { InjectRepository } from "@nestjs/typeorm"
import { EventStoreRepository } from "@domain/eventstore/repositories/EventStoreRepository"
import { EventStore } from "@domain/eventstore/model/EventStore"

@Singleton()
export class EventStoreTypeOrmRepository implements EventStoreRepository {
  constructor(
    @InjectRepository(EventStorePersistence)
    private readonly eventStoreRepository: Repository<EventStorePersistence>,
  ) {}

  async save(eventStore: EventStore): Promise<EventStore> {
    const persistence = await this.eventStoreRepository.save(eventStore as EventStorePersistence)
    return persistence as EventStore
  }
}
