// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondHolderBalanceNotFoundError extends EntityNotFoundError {
  static bondHolderPartitionError(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
  ): BondHolderBalanceNotFoundError {
    return new BondHolderBalanceNotFoundError(
      `Bond holder balance not found for bond contract id: ${bondContractId}, holder account id: ${holderAccountId}, partition: ${partition}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
