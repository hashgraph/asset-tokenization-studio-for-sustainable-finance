// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/holderbalance/errors/InsufficientBondHolderBalanceError"
import { InsufficientClearingBalanceError } from "@domain/holderbalance/errors/InsufficientClearingBalanceError"
import { InvalidClearingOperationError } from "@domain/holderbalance/errors/InvalidClearingOperationError"

@Singleton()
export class UpdateClearingBondHolderBalanceDomainService {
  constructor(
    @Inject("BondHolderBalanceRepository") private readonly bondHolderBalanceRepository: BondHolderBalanceRepository,
  ) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    operation: "CLEARING_LOCK" | "CLEARING_UNLOCK",
    transactionId?: string,
  ): Promise<void> {
    const balance = await this.bondHolderBalanceRepository.findByContractIdHolderAccountIdAndPartition(
      bondContractId,
      holderAccountId,
      partition,
    )

    if (!balance) {
      throw BondHolderBalanceNotFoundError.bondHolderPartitionError(bondContractId, holderAccountId, partition)
    }

    const amountBigInt = BigInt(amount)

    switch (operation) {
      case "CLEARING_LOCK": {
        const available = BigInt(balance.availableBalance)

        if (available < amountBigInt) {
          throw InsufficientBondHolderBalanceError.bondHolderPartitionError(
            bondContractId,
            holderAccountId,
            partition,
            balance.availableBalance,
            amount,
          )
        }

        balance.availableBalance = (available - amountBigInt).toString()
        balance.clearingBalance = (BigInt(balance.clearingBalance) + amountBigInt).toString()
        break
      }
      case "CLEARING_UNLOCK": {
        const clearing = BigInt(balance.clearingBalance)

        if (clearing < amountBigInt) {
          throw InsufficientClearingBalanceError.bondHolderPartitionError(
            bondContractId,
            holderAccountId,
            partition,
            balance.clearingBalance,
            amount,
          )
        }

        balance.clearingBalance = (clearing - amountBigInt).toString()
        balance.availableBalance = (BigInt(balance.availableBalance) + amountBigInt).toString()
        break
      }
      default:
        throw InvalidClearingOperationError.unknownOperation(operation)
    }

    await this.bondHolderBalanceRepository.save(balance, transactionId)
  }
}
