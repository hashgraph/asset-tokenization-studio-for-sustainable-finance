// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientLockedBalanceError } from "@domain/bond/holderbalance/errors/InsufficientLockedBalanceError"

@Singleton()
export class UnlockBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    unlockAmount: string,
  ): Promise<void> {
    const bondHolderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!bondHolderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const locked = BigInt(bondHolderBalance.lockedBalance)
    const unlockAmountBigInt = BigInt(unlockAmount)

    if (locked < unlockAmountBigInt) {
      throw InsufficientLockedBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        bondHolderBalance.lockedBalance,
        unlockAmount,
      )
    }

    bondHolderBalance.availableBalance = (BigInt(bondHolderBalance.availableBalance) + unlockAmountBigInt).toString()
    bondHolderBalance.lockedBalance = (locked - unlockAmountBigInt).toString()
    bondHolderBalance.updatedAt = new Date()

    await this.bondHolderBalanceRepository.save(bondHolderBalance)
  }
}
