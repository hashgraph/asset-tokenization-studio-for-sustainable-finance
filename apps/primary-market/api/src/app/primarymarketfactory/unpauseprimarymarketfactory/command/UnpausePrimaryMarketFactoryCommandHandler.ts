// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpausePrimaryMarketFactoryCommand } from "./UnpausePrimaryMarketFactoryCommand"
import type { PrimaryMarketFactoryRepository } from "@domain/primarymarketfactory/repositories/PrimaryMarketFactoryRepository"
import { PrimaryMarketFactoryUnpausedEvent } from "@domain/primarymarketfactory/events/PrimaryMarketFactoryUnpausedEvent"

@Handler(UnpausePrimaryMarketFactoryCommand)
export class UnpausePrimaryMarketFactoryCommandHandler
  implements CommandHandler<UnpausePrimaryMarketFactoryCommand, void>
{
  constructor(
    @Inject("PrimaryMarketFactoryRepository") private readonly factoryRepository: PrimaryMarketFactoryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpausePrimaryMarketFactoryCommand): Promise<void> {
    const factory = await this.factoryRepository.findByContractId(command.factoryContractId)

    if (!factory) {
      return
    }

    factory.unpause()
    await this.factoryRepository.save(factory)

    this.eventBus.publish(new PrimaryMarketFactoryUnpausedEvent(factory.contractId))
  }
}
