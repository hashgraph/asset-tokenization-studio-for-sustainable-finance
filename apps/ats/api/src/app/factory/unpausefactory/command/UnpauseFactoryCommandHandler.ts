// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpauseFactoryCommand } from "./UnpauseFactoryCommand"
import { UnpauseFactoryDomainService } from "@domain/factory/service/UnpauseFactoryDomainService"
import { FactoryUnpausedEvent } from "@domain/factory/events/FactoryUnpausedEvent"

@Handler(UnpauseFactoryCommand)
export class UnpauseFactoryCommandHandler implements CommandHandler<UnpauseFactoryCommand, void> {
  constructor(
    private readonly unpauseFactoryDomainService: UnpauseFactoryDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpauseFactoryCommand): Promise<void> {
    const factory = await this.unpauseFactoryDomainService.execute(command.factoryId)

    this.eventBus.publish(new FactoryUnpausedEvent(factory.factoryId))
  }
}
