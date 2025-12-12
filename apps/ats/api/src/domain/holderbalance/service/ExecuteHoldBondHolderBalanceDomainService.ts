// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/holderbalance/model/BondHolderBalance"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class ExecuteHoldBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    toAccountId: string,
    partition: string,
    amount: string,
    transactionId?: string,
  ): Promise<void> {
    const holderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!holderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const holderHeldBalance = BigInt(holderBalance.heldBalance)
    const executeAmount = BigInt(amount)

    if (holderHeldBalance < executeAmount) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        holderAccountId,
        partition,
        holderBalance.heldBalance,
        amount,
      )
    }

    holderBalance.heldBalance = (holderHeldBalance - executeAmount).toString()
    holderBalance.updatedAt = new Date()
    await this.bondHolderBalanceRepository.save(holderBalance, transactionId)

    const recipientBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      toAccountId,
      partition,
    )

    if (recipientBalance) {
      recipientBalance.availableBalance = (BigInt(recipientBalance.availableBalance) + executeAmount).toString()
      recipientBalance.updatedAt = new Date()
      await this.bondHolderBalanceRepository.save(recipientBalance, transactionId)
    } else {
      const newRecipientBalance = new BondHolderBalance()
      newRecipientBalance.bondContractId = bondContractId
      newRecipientBalance.holderAccountId = toAccountId
      newRecipientBalance.partition = partition
      newRecipientBalance.availableBalance = amount
      newRecipientBalance.lockedBalance = "0"
      newRecipientBalance.heldBalance = "0"
      await this.bondHolderBalanceRepository.save(newRecipientBalance, transactionId)
    }
  }
}
