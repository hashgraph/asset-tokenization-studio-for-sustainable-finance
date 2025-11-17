// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/bond/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class HoldBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(bondContractId: string, holderAccountId: string, partition: string, holdAmount: string): Promise<void> {
    const bondHolderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!bondHolderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const available = BigInt(bondHolderBalance.availableBalance)
    const locked = BigInt(bondHolderBalance.lockedBalance)
    const holdAmountBigInt = BigInt(holdAmount)

    if (available < holdAmountBigInt) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        bondHolderBalance.availableBalance,
        holdAmount,
      )
    }

    bondHolderBalance.availableBalance = (available - holdAmountBigInt).toString()
    bondHolderBalance.lockedBalance = (locked + holdAmountBigInt).toString()

    await this.bondHolderBalanceRepository.save(bondHolderBalance)
  }
}
