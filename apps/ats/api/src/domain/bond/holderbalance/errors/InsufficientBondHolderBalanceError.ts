// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class InsufficientBondHolderBalanceError extends DomainError {
  static bondHolderPartitionError(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    available: string,
    required: string,
  ): InsufficientBondHolderBalanceError {
    return new InsufficientBondHolderBalanceError(
      `Insufficient balance for bond contract id: ${bondContractId}, holder account id: ${holderAccountId}, partition: ${partition}. Available: ${available}, Required: ${required}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
