// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CreateBondLockDomainService } from "@domain/bond/lock/service/CreateBondLockDomainService"
import { DecreaseBondHolderAvailableBalanceDomainService } from "@domain/bond/holderbalance/service/DecreaseBondHolderAvailableBalanceDomainService"
import { CreatedBondLockEvent } from "@domain/bond/lock/event/CreatedBondLockEvent"
import { CreateBondLockCommand } from "./CreateBondLockCommand"

@Singleton()
@Handler(CreateBondLockCommand)
export class CreateBondLockCommandHandler implements CommandHandler<CreateBondLockCommand, void> {
  constructor(
    private readonly createBondLockDomainService: CreateBondLockDomainService,
    private readonly decreaseBondHolderAvailableBalanceDomainService: DecreaseBondHolderAvailableBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateBondLockCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const bondLock = await this.createBondLockDomainService.execute(command)

      await this.decreaseBondHolderAvailableBalanceDomainService.execute(
        bondLock.contractId,
        bondLock.holderAccountId,
        bondLock.partition,
        bondLock.amount,
        "locked",
      )

      this.eventBus.publish(
        new CreatedBondLockEvent(
          bondLock.id,
          bondLock.contractId,
          bondLock.holderAccountId,
          bondLock.partition,
          bondLock.amount,
          bondLock.expirationTimestamp,
          bondLock.operatorAccountId,
        ),
      )
    })
  }
}
