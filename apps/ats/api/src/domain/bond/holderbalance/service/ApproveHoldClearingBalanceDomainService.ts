// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientClearingBalanceError } from "@domain/bond/holderbalance/errors/InsufficientClearingBalanceError"

@Singleton()
export class ApproveHoldClearingBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(bondContractId: string, holderAccountId: string, partition: string, amount: string): Promise<void> {
    const balance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!balance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const amountBigInt = BigInt(amount)
    const clearingBalance = BigInt(balance.clearingBalance)

    if (clearingBalance < amountBigInt) {
      throw InsufficientClearingBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        balance.clearingBalance,
        amount,
      )
    }

    balance.clearingBalance = (clearingBalance - amountBigInt).toString()
    balance.heldBalance = (BigInt(balance.heldBalance) + amountBigInt).toString()
    balance.updatedAt = new Date()

    await this.bondHolderBalanceRepository.save(balance)
  }
}
