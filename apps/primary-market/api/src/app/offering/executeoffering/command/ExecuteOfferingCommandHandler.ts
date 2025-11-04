// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingCommand } from "./ExecuteOfferingCommand"
import { ExecuteOfferingDomainService } from "@domain/offering/services/ExecuteOfferingDomainService"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { OfferingExecutedEvent } from "@domain/offering/event/OfferingExecutedEvent"

@Singleton()
@Handler(ExecuteOfferingCommand)
export class ExecuteOfferingCommandHandler implements CommandHandler<ExecuteOfferingCommand, void> {
  constructor(
    private readonly executeOfferingDomainService: ExecuteOfferingDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ExecuteOfferingCommand): Promise<void> {
    await this.executeOfferingDomainService.execute(command)
    this.eventBus.publish(
      new OfferingExecutedEvent(
        command.offeringId,
        command.marketId,
        command.operatorId,
        command.subscriptionIdsSuccess,
        command.subscriptionIdsFailed,
      ),
    )
  }
}
