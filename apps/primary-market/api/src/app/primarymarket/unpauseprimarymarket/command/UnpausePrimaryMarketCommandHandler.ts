// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpausePrimaryMarketCommand } from "@app/primarymarket/unpauseprimarymarket/command/UnpausePrimaryMarketCommand"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { PrimaryMarketRepository } from "@domain/primarymarket/repositories/PrimaryMarketRepository"
import { PrimaryMarketUnpausedEvent } from "@domain/primarymarket/events/PrimaryMarketUnpausedEvent"

@Handler(UnpausePrimaryMarketCommand)
export class UnpausePrimaryMarketCommandHandler implements CommandHandler<UnpausePrimaryMarketCommand, void> {
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    @Inject() private readonly primaryMarketRepository: PrimaryMarketRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpausePrimaryMarketCommand): Promise<void> {
    const primaryMarket = await this.checkPrimaryMarketExistsDomainService.execute(command.marketContractId)

    primaryMarket.unpause()
    await this.primaryMarketRepository.save(primaryMarket)

    this.eventBus.publish(new PrimaryMarketUnpausedEvent(primaryMarket.contractId))
  }
}
