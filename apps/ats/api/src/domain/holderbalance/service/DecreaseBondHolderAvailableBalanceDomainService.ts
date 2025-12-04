// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class DecreaseBondHolderAvailableBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    balanceType: "locked" | "held",
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

    const available = BigInt(bondHolderBalance.availableBalance)
    const amountBigInt = BigInt(amount)

    if (available < amountBigInt) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        bondHolderBalance.availableBalance,
        amount,
      )
    }

    bondHolderBalance.availableBalance = (available - amountBigInt).toString()

    if (balanceType === "locked") {
      const locked = BigInt(bondHolderBalance.lockedBalance)
      bondHolderBalance.lockedBalance = (locked + amountBigInt).toString()
    } else {
      const held = BigInt(bondHolderBalance.heldBalance)
      bondHolderBalance.heldBalance = (held + amountBigInt).toString()
    }

    await this.bondHolderBalanceRepository.save(bondHolderBalance, transactionId)
  }
}
