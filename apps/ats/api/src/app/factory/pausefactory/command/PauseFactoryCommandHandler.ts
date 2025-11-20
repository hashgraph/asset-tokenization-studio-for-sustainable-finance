// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PauseFactoryCommand } from "./PauseFactoryCommand"
import { PauseFactoryDomainService } from "@domain/factory/service/PauseFactoryDomainService"
import { FactoryPausedEvent } from "@domain/factory/events/FactoryPausedEvent"

@Handler(PauseFactoryCommand)
export class PauseFactoryCommandHandler implements CommandHandler<PauseFactoryCommand, void> {
  constructor(
    private readonly pauseFactoryDomainService: PauseFactoryDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PauseFactoryCommand): Promise<void> {
    const factory = await this.pauseFactoryDomainService.execute(command.factoryId)

    this.eventBus.publish(new FactoryPausedEvent(factory.factoryId))
  }
}
