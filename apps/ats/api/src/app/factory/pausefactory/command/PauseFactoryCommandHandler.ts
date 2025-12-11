// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PauseFactoryCommand } from "./PauseFactoryCommand"
import type { FactoryRepository } from "@domain/factory/repositories/FactoryRepository"
import { FactoryPausedEvent } from "@domain/factory/events/FactoryPausedEvent"

@Handler(PauseFactoryCommand)
export class PauseFactoryCommandHandler implements CommandHandler<PauseFactoryCommand, void> {
  constructor(
    @Inject() private readonly factoryRepository: FactoryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PauseFactoryCommand): Promise<void> {
    const factory = await this.factoryRepository.findByFactoryId(command.factoryContractId)

    if (!factory) {
      return
    }

    factory.pause()
    await this.factoryRepository.save(factory)

    this.eventBus.publish(new FactoryPausedEvent(factory.bondContractId))
  }
}
