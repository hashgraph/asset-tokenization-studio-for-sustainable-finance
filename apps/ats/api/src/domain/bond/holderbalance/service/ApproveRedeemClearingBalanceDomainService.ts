// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/bond/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class ApproveRedeemClearingBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
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

    const clearing = BigInt(bondHolderBalance.clearingBalance)
    const redeemAmount = BigInt(amount)

    if (clearing < redeemAmount) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        bondHolderBalance.clearingBalance,
        amount,
      )
    }

    bondHolderBalance.clearingBalance = (clearing - redeemAmount).toString()
    bondHolderBalance.updatedAt = new Date()

    await this.bondHolderBalanceRepository.save(bondHolderBalance, transactionId)
  }
}
