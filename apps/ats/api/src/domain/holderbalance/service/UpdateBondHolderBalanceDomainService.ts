// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/holderbalance/model/BondHolderBalance"

@Singleton()
export class UpdateBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(bondContractId: string, holderAccountId: string, partition: string, amount: string): Promise<void> {
    const existing = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (existing) {
      const amountBigInt = BigInt(amount)
      existing.availableBalance = (BigInt(existing.availableBalance) + amountBigInt).toString()
      existing.updatedAt = new Date()
      await this.bondHolderBalanceRepository.save(existing)
    } else {
      const bondHolderBalance = new BondHolderBalance()
      bondHolderBalance.bondContractId = bondContractId
      bondHolderBalance.holderAccountId = holderAccountId
      bondHolderBalance.partition = partition
      bondHolderBalance.availableBalance = amount
      bondHolderBalance.lockedBalance = "0"
      bondHolderBalance.clearingBalance = "0"
      await this.bondHolderBalanceRepository.save(bondHolderBalance)
    }
  }
}
