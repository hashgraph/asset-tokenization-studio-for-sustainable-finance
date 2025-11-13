// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockCommand } from "./ReleaseBondLockCommand"
import type { BondLockRepository } from "@domain/bond/lock/repository/BondLockRepository"
import { BondLockNotFoundError } from "@domain/bond/lock/errors/BondLockNotFoundError"
import { UnlockBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UnlockBondHolderBalanceDomainService"
import { DeleteBondLockDomainService } from "@domain/bond/lock/service/DeleteBondLockDomainService"
import { ReleasedBondLockEvent } from "@domain/bond/lock/event/ReleasedBondLockEvent"

@Singleton()
@Handler(ReleaseBondLockCommand)
export class ReleaseBondLockCommandHandler implements CommandHandler<ReleaseBondLockCommand, void> {
  constructor(
    private readonly deleteBondLockDomainService: DeleteBondLockDomainService,
    private readonly unlockBondHolderBalanceDomainService: UnlockBondHolderBalanceDomainService,
    @Inject() private readonly bondLockRepository: BondLockRepository,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ReleaseBondLockCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const existingLock = await this.bondLockRepository.findByBondContractIdAndId(
        command.bondContractId,
        command.lockId,
      )
      if (!existingLock) {
        throw BondLockNotFoundError.lockIdError(command.bondContractId, command.lockId)
      }
      await this.deleteBondLockDomainService.execute(command)
      await this.unlockBondHolderBalanceDomainService.execute(
        command.bondContractId,
        command.holderAccountId,
        command.partition,
        existingLock.amount,
      )
      this.eventBus.publish(
        new ReleasedBondLockEvent(
          command.lockId,
          command.bondContractId,
          command.holderAccountId,
          command.partition,
          existingLock.amount,
          command.operatorAccountId,
        ),
      )
    })
  }
}
