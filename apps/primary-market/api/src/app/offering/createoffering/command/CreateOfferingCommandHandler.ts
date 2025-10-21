// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CreateOfferingCommand } from "./CreateOfferingCommand"
import { CreateOfferingDomainService } from "@domain/offering/services/CreateOfferingDomainService"
import { CreatedOfferingEvent } from "@domain/offering/event/CreatedOfferingEvent"

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
      new CreatedOfferingEvent(
        offering.id,
        offering.offeringId,
        offering.market.contractId,
        offering.bondId,
        offering.status,
        offering.treasuryId,
        offering.paymentTokenId,
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
