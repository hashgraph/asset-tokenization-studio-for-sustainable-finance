// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class ReleaseHoldBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    releaseAmount: string,
    transactionId?: string,
  ): Promise<void> {
    const bondHolderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!bondHolderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const held = BigInt(bondHolderBalance.heldBalance)
    const releaseAmountBigInt = BigInt(releaseAmount)

    if (held < releaseAmountBigInt) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        bondHolderBalance.heldBalance,
        releaseAmount,
      )
    }

    bondHolderBalance.availableBalance = (BigInt(bondHolderBalance.availableBalance) + releaseAmountBigInt).toString()
    bondHolderBalance.heldBalance = (held - releaseAmountBigInt).toString()
    bondHolderBalance.updatedAt = new Date()

    await this.bondHolderBalanceRepository.save(bondHolderBalance, transactionId)
  }
}
