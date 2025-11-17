// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/bond/holderbalance/model/BondHolderBalance"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/bond/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class TransferBondHolderBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    fromAccountId: string,
    toAccountId: string,
    partition: string,
    amount: string,
  ): Promise<void> {
    const senderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      fromAccountId,
      partition,
    )
    if (!senderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, fromAccountId, partition)
    }

    const senderAvailableBalance = BigInt(senderBalance.availableBalance)
    const transferAmount = BigInt(amount)

    if (senderAvailableBalance < transferAmount) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        fromAccountId,
        partition,
        senderBalance.availableBalance,
        amount,
      )
    }

    senderBalance.availableBalance = (senderAvailableBalance - transferAmount).toString()
    await this.bondHolderBalanceRepository.save(senderBalance)

    const receiverBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      toAccountId,
      partition,
    )

    if (receiverBalance) {
      receiverBalance.availableBalance = (BigInt(receiverBalance.availableBalance) + transferAmount).toString()
      receiverBalance.updatedAt = new Date()
      await this.bondHolderBalanceRepository.save(receiverBalance)
    } else {
      const newReceiverBalance = new BondHolderBalance()
      newReceiverBalance.contractId = bondContractId
      newReceiverBalance.holderAccountId = toAccountId
      newReceiverBalance.partition = partition
      newReceiverBalance.availableBalance = amount
      newReceiverBalance.lockedBalance = "0"
      await this.bondHolderBalanceRepository.save(newReceiverBalance)
    }
  }
}
