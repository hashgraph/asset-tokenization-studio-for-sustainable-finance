// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PausePrimaryMarketFactoryCommand } from "./PausePrimaryMarketFactoryCommand"
import type { PrimaryMarketFactoryRepository } from "@domain/primarymarketfactory/repositories/PrimaryMarketFactoryRepository"
import { PrimaryMarketFactoryPausedEvent } from "@domain/primarymarketfactory/events/PrimaryMarketFactoryPausedEvent"

@Handler(PausePrimaryMarketFactoryCommand)
export class PausePrimaryMarketFactoryCommandHandler implements CommandHandler<PausePrimaryMarketFactoryCommand, void> {
  constructor(
    @Inject("PrimaryMarketFactoryRepository") private readonly factoryRepository: PrimaryMarketFactoryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PausePrimaryMarketFactoryCommand): Promise<void> {
    const factory = await this.factoryRepository.findByContractId(command.factoryContractId)

    if (!factory) {
      return
    }

    factory.pause()
    await this.factoryRepository.save(factory)

    this.eventBus.publish(new PrimaryMarketFactoryPausedEvent(factory.contractId))
  }
}
