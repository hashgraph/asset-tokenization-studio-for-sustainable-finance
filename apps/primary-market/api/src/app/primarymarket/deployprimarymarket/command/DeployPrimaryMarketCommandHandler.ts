// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { Singleton, Handler, Validate, CommandHandler, Inject } from "@hashgraph/green-bonds-shared-core"
import { DeployPrimaryMarketCommand } from "./DeployPrimaryMarketCommand"
import { DeployPrimaryMarketDomainService } from "@domain/primarymarket/services/DeployPrimaryMarketDomainService"
import { PrimaryMarketDeployedEvent } from "@domain/primarymarket/events/PrimaryMarketDeployedEvent"
import { DeployPrimaryMarketDomainServiceRequest } from "@domain/primarymarket/services/model/DeployPrimaryMarketDomainServiceRequest"

@Singleton()
@Handler(DeployPrimaryMarketCommand)
export class DeployPrimaryMarketCommandHandler implements CommandHandler<DeployPrimaryMarketCommand, void> {
  constructor(
    private readonly deployPrimaryMarketDomainService: DeployPrimaryMarketDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: DeployPrimaryMarketCommand): Promise<void> {
    const primaryMarket = await this.deployPrimaryMarketDomainService.execute(
      new DeployPrimaryMarketDomainServiceRequest(command.contractId),
    )

    this.eventBus.publish(new PrimaryMarketDeployedEvent(primaryMarket.contractId))
  }
}
