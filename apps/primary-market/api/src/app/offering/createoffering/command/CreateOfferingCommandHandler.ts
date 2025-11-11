// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CreateOfferingCommand } from "./CreateOfferingCommand"
import { CreateOfferingDomainService } from "@domain/offering/services/CreateOfferingDomainService"
import { OfferingCreatedEvent } from "@domain/offering/event/OfferingCreatedEvent"

@Singleton()
@Handler(CreateOfferingCommand)
export class CreateOfferingCommandHandler implements CommandHandler<CreateOfferingCommand, void> {
  constructor(
    private readonly createOfferingDomainService: CreateOfferingDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateOfferingCommand): Promise<void> {
    const offering = await this.createOfferingDomainService.execute(command)
    this.eventBus.publish(
      new OfferingCreatedEvent(
        offering.offeringDltId,
        offering.market.contractId,
        offering.bondContractId,
        offering.operatorAccountId,
        offering.treasuryContractId,
        offering.paymentTokenContractId,
        offering.lotSize,
        offering.minQuantity,
        offering.maxQuantity,
        offering.targetQuantity,
        offering.targetQuantityRule,
        offering.startDate,
        offering.endDate,
        offering.deadlineRule,
      ),
    )
  }
}
