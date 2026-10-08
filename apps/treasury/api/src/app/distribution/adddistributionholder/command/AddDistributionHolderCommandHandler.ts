// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddDistributionHolderCommand } from "@app/distribution/adddistributionholder/command/AddDistributionHolderCommand"
import type { DistributionHolderRepository } from "@domain/distribution/repositories/DistributionHolderRepository"
import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"
import { DistributionHolderAddedEvent } from "@domain/distribution/event/DistributionHolderAddedEvent"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"

@Singleton()
@Handler(AddDistributionHolderCommand)
export class AddDistributionHolderCommandHandler implements CommandHandler<AddDistributionHolderCommand, void> {
  constructor(
    @Inject() private readonly distributionHolderRepository: DistributionHolderRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddDistributionHolderCommand): Promise<void> {
    const distributionHolder = await this.distributionHolderRepository.save({
      holderAccountId: command.holderAccountId,
      status: command.status as DistributionHolderStatus,
      amount: command.amount,
      distributionId: command.distributionId,
      paymentTokenId: command.paymentTokenId,
    } as DistributionHolder)

    this.eventBus.publish(
      new DistributionHolderAddedEvent(
        distributionHolder.holderAccountId,
        distributionHolder.status,
        distributionHolder.amount,
        distributionHolder.distributionId,
      ),
    )
  }
}
