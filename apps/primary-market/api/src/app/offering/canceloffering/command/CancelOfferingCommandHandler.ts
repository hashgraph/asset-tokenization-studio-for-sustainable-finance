// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingCommand } from "./CancelOfferingCommand"
import { CancelOfferingDomainService } from "@domain/offering/services/CancelOfferingDomainService"
import { OfferingCancelledEvent } from "@domain/offering/event/OfferingCancelledEvent"

@Singleton()
@Handler(CancelOfferingCommand)
export class CancelOfferingCommandHandler implements CommandHandler<CancelOfferingCommand, void> {
  constructor(
    private readonly cancelOfferingDomainService: CancelOfferingDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CancelOfferingCommand): Promise<void> {
    await this.cancelOfferingDomainService.execute(command)
    this.eventBus.publish(
      new OfferingCancelledEvent(
        command.offeringDltId,
        command.marketContractId,
        command.operatorAccountId,
        command.subscriptionDltIdsSuccess,
        command.subscriptionDltIdsFailed,
      ),
    )
  }
}
