// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, EventBus, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddEventFiltersCommand } from "@app/eventfilter/addeventfilters/command/AddEventFiltersCommand"
import { AddEventFiltersDomainService } from "@domain/eventfilter/services/AddEventFiltersDomainService"
import { EventFiltersAdded } from "@domain/eventfilter/events/EventFiltersAdded"

@Singleton()
@Handler(AddEventFiltersCommand)
export class AddEventFiltersCommandHandler implements CommandHandler<AddEventFiltersCommand, void> {
  constructor(
    private readonly addEventFiltersDomainService: AddEventFiltersDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddEventFiltersCommand): Promise<void> {
    await this.addEventFiltersDomainService.execute(command.contractAddress, command.eventSignatures)
    this.eventBus.publish(new EventFiltersAdded(command.contractAddress, command.eventSignatures))
  }
}
