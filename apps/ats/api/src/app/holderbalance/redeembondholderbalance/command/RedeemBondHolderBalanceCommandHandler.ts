// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { RedeemBondHolderBalanceCommand } from "./RedeemBondHolderBalanceCommand"
import { RedeemBondHolderBalanceDomainService } from "@domain/holderbalance/service/RedeemBondHolderBalanceDomainService"
import { RedeemedBondHolderBalanceEvent } from "@domain/holderbalance/event/RedeemedBondHolderBalanceEvent"

@Singleton()
@Handler(RedeemBondHolderBalanceCommand)
export class RedeemBondHolderBalanceCommandHandler implements CommandHandler<RedeemBondHolderBalanceCommand, void> {
  constructor(
    private readonly redeemBondHolderBalanceDomainService: RedeemBondHolderBalanceDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: RedeemBondHolderBalanceCommand): Promise<void> {
    await this.redeemBondHolderBalanceDomainService.execute(
      command.bondContractId,
      command.holderAccountId,
      command.partition,
      command.amount,
    )

    this.eventBus.publish(
      new RedeemedBondHolderBalanceEvent(
        command.bondContractId,
        command.holderAccountId,
        command.partition,
        command.amount,
      ),
    )
  }
}
