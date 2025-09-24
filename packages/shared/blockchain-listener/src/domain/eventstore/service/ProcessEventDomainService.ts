// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import BlockchainEvent from "@domain/event/BlockchainEvent"
import { EventStore } from "@domain/eventstore/model/EventStore"
import type { EventStoreRepository } from "@domain/eventstore/repositories/EventStoreRepository"

@Singleton()
export class ProcessEventDomainService {
  constructor(
    @Inject() private readonly eventStoreRepository: EventStoreRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  async execute(blockchainEvent: BlockchainEvent): Promise<EventStore> {
    const eventStore = new EventStore()
    eventStore.eventName = blockchainEvent.name
    eventStore.data = JSON.stringify(blockchainEvent)

    // Process event
    try {
      await this.eventBus.publishSync(blockchainEvent, blockchainEvent.name + "DLTEvent")
      eventStore.process()
    } catch (error) {
      // Transit to failed with error reason
      eventStore.failed(error.message as string)
    }

    return await this.eventStoreRepository.save(eventStore)
  }
}
