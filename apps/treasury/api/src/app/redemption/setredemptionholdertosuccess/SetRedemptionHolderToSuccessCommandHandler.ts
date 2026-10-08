// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { RedemptionHolderRepository } from "@domain/redemption/repositories/RedemptionHolderRepository"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"
import { SetRedemptionHolderToSuccessCommand } from "@app/redemption/setredemptionholdertosuccess/SetRedemptionHolderToSuccessCommand"
import { CheckRedemptionHolderExistsDomainService } from "@domain/redemption/service/CheckRedemptionHolderExistsDomainService"
import { RedemptionHolderToSuccessSetEvent } from "@domain/redemption/event/RedemptionHolderToSuccessSetEvent"

@Singleton()
@Handler(SetRedemptionHolderToSuccessCommand)
export class SetRedemptionHolderToSuccessCommandHandler
  implements CommandHandler<SetRedemptionHolderToSuccessCommand, void>
{
  constructor(
    private readonly checkRedemptionHolderExistsDomainService: CheckRedemptionHolderExistsDomainService,
    @Inject() private readonly redemptionHolderRepository: RedemptionHolderRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetRedemptionHolderToSuccessCommand): Promise<void> {
    const redemptionHolder = await this.checkRedemptionHolderExistsDomainService.execute(
      command.treasuryId,
      command.holderAccountId,
      RedemptionHolderStatus.FAILED,
    )
    redemptionHolder.success(command.paymentTokenId, command.amount)
    await this.redemptionHolderRepository.save(redemptionHolder)

    this.eventBus.publish(
      new RedemptionHolderToSuccessSetEvent(command.holderAccountId, command.amount, command.treasuryId),
    )
  }
}
