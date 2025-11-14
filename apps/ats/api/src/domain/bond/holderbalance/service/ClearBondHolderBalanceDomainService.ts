// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalanceNotFoundError } from "@domain/bond/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/bond/holderbalance/errors/InsufficientBondHolderBalanceError"

@Singleton()
export class ClearBondHolderBalanceDomainService {
  constructor(@Inject("BondHolderBalanceRepository") private readonly bondHolderBalanceRepository: BondHolderBalanceRepository) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    operation: "CLEARING_LOCK" | "CLEARING_UNLOCK" | "CLEARING_EXECUTE",
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
      case "CLEARING_LOCK":
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

      case "CLEARING_UNLOCK":
        const clearing = BigInt(balance.clearingBalance)

        if (clearing < amountBigInt) {
          throw new Error(
            `Insufficient clearing balance for ${bondContractId}/${holderAccountId}/${partition}: ` +
              `has ${balance.clearingBalance}, needs ${amount}`,
          )
        }

        balance.clearingBalance = (clearing - amountBigInt).toString()
        balance.availableBalance = (BigInt(balance.availableBalance) + amountBigInt).toString()
        break

      case "CLEARING_EXECUTE":
        const clearingBalance = BigInt(balance.clearingBalance)

        if (clearingBalance < amountBigInt) {
          throw new Error(
            `Insufficient clearing balance for ${bondContractId}/${holderAccountId}/${partition}: ` +
              `has ${balance.clearingBalance}, needs ${amount}`,
          )
        }

        balance.clearingBalance = (clearingBalance - amountBigInt).toString()
        balance.lockedBalance = (BigInt(balance.lockedBalance) + amountBigInt).toString()
        break

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    await this.bondHolderBalanceRepository.save(balance)
  }
}
