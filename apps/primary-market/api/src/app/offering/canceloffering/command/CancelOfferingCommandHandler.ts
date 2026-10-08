// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingCommand } from "./CancelOfferingCommand"
import { ProcessOfferingDomainService } from "@domain/offering/services/ProcessOfferingDomainService"
import { OfferingCancelledEvent } from "@domain/offering/event/OfferingCancelledEvent"

@Singleton()
@Handler(CancelOfferingCommand)
export class CancelOfferingCommandHandler implements CommandHandler<CancelOfferingCommand, void> {
  constructor(
    private readonly processOfferingDomainService: ProcessOfferingDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CancelOfferingCommand): Promise<void> {
    await this.processOfferingDomainService.execute(command)
    this.eventBus.publish(
      new OfferingCancelledEvent(
        command.offeringId,
        command.marketContractId,
        command.operatorAccountId,
        command.processResults,
      ),
    )
  }
}
