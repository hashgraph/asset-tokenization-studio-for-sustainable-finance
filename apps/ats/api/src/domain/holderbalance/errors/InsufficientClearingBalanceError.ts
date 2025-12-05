// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class InsufficientClearingBalanceError extends DomainError {
  static bondHolderPartitionError(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    clearingBalance: string,
    required: string,
  ): InsufficientClearingBalanceError {
    return new InsufficientClearingBalanceError(
      `Insufficient clearing balance for bond contract id: ${bondContractId}, holder account id: ${holderAccountId}, partition: ${partition}. Clearing balance: ${clearingBalance}, Required: ${required}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
