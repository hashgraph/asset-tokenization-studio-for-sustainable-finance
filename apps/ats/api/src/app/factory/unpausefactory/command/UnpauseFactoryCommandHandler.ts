// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpauseFactoryCommand } from "./UnpauseFactoryCommand"
import type { FactoryRepository } from "@domain/factory/repositories/FactoryRepository"
import { FactoryUnpausedEvent } from "@domain/factory/events/FactoryUnpausedEvent"

@Handler(UnpauseFactoryCommand)
export class UnpauseFactoryCommandHandler implements CommandHandler<UnpauseFactoryCommand, void> {
  constructor(
    @Inject() private readonly factoryRepository: FactoryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpauseFactoryCommand): Promise<void> {
    const factory = await this.factoryRepository.findByFactoryId(command.factoryContractId)

    if (!factory) {
      return
    }

    factory.unpause()
    await this.factoryRepository.save(factory)

    this.eventBus.publish(new FactoryUnpausedEvent(factory.bondContractId))
  }
}
