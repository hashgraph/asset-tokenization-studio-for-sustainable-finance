// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PausePrimaryMarketCommand } from "@app/primarymarket/pauseprimarymarket/command/PausePrimaryMarketCommand"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { PrimaryMarketRepository } from "@domain/primarymarket/repositories/PrimaryMarketRepository"
import { PrimaryMarketPausedEvent } from "@domain/primarymarket/events/PrimaryMarketPausedEvent"

@Handler(PausePrimaryMarketCommand)
export class PausePrimaryMarketCommandHandler implements CommandHandler<PausePrimaryMarketCommand, void> {
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    @Inject() private readonly primaryMarketRepository: PrimaryMarketRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PausePrimaryMarketCommand): Promise<void> {
    const primaryMarket = await this.checkPrimaryMarketExistsDomainService.execute(command.marketContractId)

    primaryMarket.pause()
    await this.primaryMarketRepository.save(primaryMarket)

    this.eventBus.publish(new PrimaryMarketPausedEvent(primaryMarket.contractId))
  }
}
