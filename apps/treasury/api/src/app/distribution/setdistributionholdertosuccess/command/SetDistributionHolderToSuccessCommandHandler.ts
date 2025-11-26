// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { DistributionHolderRepository } from "@domain/distribution/repositories/DistributionHolderRepository"
import { SetDistributionHolderToSuccessCommand } from "@app/distribution/setdistributionholdertosuccess/command/SetDistributionHolderToSuccessCommand"
import { CheckDistributionHolderExistsDomainService } from "@domain/distribution/services/CheckDistributionHolderExistsDomainService"
import { DistributionHolderToSucessSetEvent } from "@domain/distribution/event/DistributionHolderToSucessSetEvent"

@Singleton()
@Handler(SetDistributionHolderToSuccessCommand)
export class SetDistributionHolderToSuccessCommandHandler
  implements CommandHandler<SetDistributionHolderToSuccessCommand, void>
{
  constructor(
    private readonly checkDistributionHolderExistsDomainService: CheckDistributionHolderExistsDomainService,
    @Inject() private readonly distributionHolderRepository: DistributionHolderRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetDistributionHolderToSuccessCommand): Promise<void> {
    const distributionHolder = await this.checkDistributionHolderExistsDomainService.execute(
      command.distributionId,
      command.holderAccountId,
    )
    distributionHolder.success(command.paymentTokenId, command.amount)
    await this.distributionHolderRepository.save(distributionHolder)

    this.eventBus.publish(
      new DistributionHolderToSucessSetEvent(command.holderAccountId, command.amount, command.distributionId),
    )
  }
}
