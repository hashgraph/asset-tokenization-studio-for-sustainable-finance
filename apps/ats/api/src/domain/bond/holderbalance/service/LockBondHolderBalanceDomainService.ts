// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/bond/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class LockBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(bondContractId: string, holderAccountId: string, partition: string, lockAmount: string): Promise<void> {
    const bondHolderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!bondHolderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const available = BigInt(bondHolderBalance.availableBalance)
    const lockAmountBigInt = BigInt(lockAmount)

    if (available < lockAmountBigInt) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        bondHolderBalance.availableBalance,
        lockAmount,
      )
    }

    bondHolderBalance.availableBalance = (available - lockAmountBigInt).toString()
    bondHolderBalance.lockedBalance = (BigInt(bondHolderBalance.lockedBalance) + lockAmountBigInt).toString()

    await this.bondHolderBalanceRepository.save(bondHolderBalance)
  }
}
