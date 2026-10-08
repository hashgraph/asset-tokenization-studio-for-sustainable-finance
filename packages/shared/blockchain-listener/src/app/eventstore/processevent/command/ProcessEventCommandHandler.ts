// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { ProcessEventCommand } from "@app/eventstore/processevent/command/ProcessEventCommand"
import { ProcessEventDomainService } from "@domain/eventstore/services/ProcessEventDomainService"
import { EventProcessedEvent } from "@domain/eventstore/events/EventProcessedEvent"
import { EventStoreCommandResponse } from "@app/eventstore/processevent/command/EventStoreCommandResponse"
import { plainToInstance } from "class-transformer"

@Singleton()
@Handler(ProcessEventCommand)
export class ProcessEventCommandHandler implements CommandHandler<ProcessEventCommand, EventStoreCommandResponse> {
  constructor(
    private readonly processEventDomainService: ProcessEventDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ProcessEventCommand): Promise<EventStoreCommandResponse> {
    const eventStore = await this.processEventDomainService.execute(command.event, command.transactionId)
    this.eventBus.publish(
      new EventProcessedEvent(eventStore.id, eventStore.eventName, eventStore.status, eventStore.errorReason),
    )
    return plainToInstance(EventStoreCommandResponse, eventStore)
  }
}
