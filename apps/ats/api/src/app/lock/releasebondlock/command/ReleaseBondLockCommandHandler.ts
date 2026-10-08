// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockCommand } from "./ReleaseBondLockCommand"
import type { BondLockRepository } from "@domain/lock/repository/BondLockRepository"
import { BondLockNotFoundError } from "@domain/lock/errors/BondLockNotFoundError"
import { UnlockBondHolderBalanceDomainService } from "@domain/holderbalance/service/UnlockBondHolderBalanceDomainService"
import { DeleteBondLockDomainService } from "@domain/lock/service/DeleteBondLockDomainService"
import { ReleasedBondLockEvent } from "@domain/lock/event/ReleasedBondLockEvent"

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
    await this.transactionManager.execute(async (transactionId) => {
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
        transactionId,
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
