// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/holderbalance/model/BondHolderBalance"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class ApproveTransferClearingBalanceDomainService {
  constructor(@Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    fromAccountId: string,
    toAccountId: string,
    partition: string,
    amount: string,
    transactionId?: string,
  ): Promise<void> {
    const senderBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      fromAccountId,
      partition,
    )

    if (!senderBalance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, fromAccountId, partition)
    }

    const senderClearing = BigInt(senderBalance.clearingBalance)
    const transferAmount = BigInt(amount)

    if (senderClearing < transferAmount) {
      throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
        bondContractId,
        fromAccountId,
        partition,
        senderBalance.clearingBalance,
        amount,
      )
    }

    senderBalance.clearingBalance = (senderClearing - transferAmount).toString()
    senderBalance.updatedAt = new Date()
    await this.bondHolderBalanceRepository.save(senderBalance, transactionId)

    const receiverBalance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      toAccountId,
      partition,
    )

    if (receiverBalance) {
      receiverBalance.availableBalance = (BigInt(receiverBalance.availableBalance) + transferAmount).toString()
      receiverBalance.updatedAt = new Date()
      await this.bondHolderBalanceRepository.save(receiverBalance, transactionId)
    } else {
      const newReceiverBalance = new BondHolderBalance()
      newReceiverBalance.contractId = bondContractId
      newReceiverBalance.holderAccountId = toAccountId
      newReceiverBalance.partition = partition
      newReceiverBalance.availableBalance = amount
      newReceiverBalance.lockedBalance = "0"
      newReceiverBalance.clearingBalance = "0"
      newReceiverBalance.heldBalance = "0"
      await this.bondHolderBalanceRepository.save(newReceiverBalance, transactionId)
    }
  }
}
