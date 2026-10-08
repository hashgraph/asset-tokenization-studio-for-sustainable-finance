// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CreateBondHoldDomainService } from "@domain/hold/service/CreateBondHoldDomainService"
import { DecreaseBondHolderAvailableBalanceDomainService } from "@domain/holderbalance/service/DecreaseBondHolderAvailableBalanceDomainService"
import { CreatedBondHoldEvent } from "@domain/hold/event/CreatedBondHoldEvent"
import { CreateBondHoldCommand } from "./CreateBondHoldCommand"

@Singleton()
@Handler(CreateBondHoldCommand)
export class CreateBondHoldCommandHandler implements CommandHandler<CreateBondHoldCommand, void> {
  constructor(
    private readonly createBondHoldDomainService: CreateBondHoldDomainService,
    private readonly decreaseBondHolderAvailableBalanceDomainService: DecreaseBondHolderAvailableBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateBondHoldCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const bondHold = await this.createBondHoldDomainService.execute(command, transactionId)

      //Check if the bond holder balance exists and update it if it does
      await this.decreaseBondHolderAvailableBalanceDomainService.execute(
        bondHold.bondContractId,
        bondHold.holderAccountId,
        bondHold.partition,
        bondHold.amount,
        "held",
        transactionId,
      )

      this.eventBus.publish(
        new CreatedBondHoldEvent(
          bondHold.id,
          bondHold.bondContractId,
          bondHold.holderAccountId,
          bondHold.partition,
          bondHold.amount,
          bondHold.expirationTimestamp,
          bondHold.escrowAccountId,
          bondHold.toAccountId,
          bondHold.data,
          bondHold.operatorAccountId,
        ),
      )
    })
  }
}
