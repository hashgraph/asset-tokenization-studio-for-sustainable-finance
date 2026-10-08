// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { AddRedemptionHolderCommand } from "@app/redemption/addredemptionholder/AddRedemptionHolderCommand"
import type { RedemptionHolderRepository } from "@domain/redemption/repositories/RedemptionHolderRepository"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"
import { RedemptionHolder } from "@domain/redemption/model/RedemptionHolder"
import { RedemptionHolderAddedEvent } from "@domain/redemption/event/RedemptionHolderAddedEvent"

@Singleton()
@Handler(AddRedemptionHolderCommand)
export class AddRedemptionHolderCommandHandler implements CommandHandler<AddRedemptionHolderCommand, void> {
  constructor(
    @Inject() private readonly redemptionHolderRepository: RedemptionHolderRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddRedemptionHolderCommand): Promise<void> {
    const redemptionHolder = await this.redemptionHolderRepository.save({
      holderAccountId: command.holderAccountId,
      status: command.status as RedemptionHolderStatus,
      amount: command.amount,
      treasuryId: command.treasuryId,
      paymentTokenId: command.paymentTokenId,
    } as RedemptionHolder)

    this.eventBus.publish(
      new RedemptionHolderAddedEvent(
        redemptionHolder.holderAccountId,
        redemptionHolder.status,
        redemptionHolder.amount,
        redemptionHolder.treasuryId,
      ),
    )
  }
}
