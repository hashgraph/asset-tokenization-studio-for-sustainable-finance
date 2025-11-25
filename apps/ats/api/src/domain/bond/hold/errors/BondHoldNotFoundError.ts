// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondHoldNotFoundError extends EntityNotFoundError {
  static withId(bondContractId: string, holderAccountId: string, holdId: number): BondHoldNotFoundError {
    return new BondHoldNotFoundError(
      `Bond hold with id ${holdId} not found for holder ${holderAccountId} in bond ${bondContractId}`,
    )
  }

  static forContractAndHolder(bondContractId: string, holderAccountId: string, holdId: number): BondHoldNotFoundError {
    return new BondHoldNotFoundError(
      `Bond hold with id ${holdId} not found for bond contract ${bondContractId} and holder ${holderAccountId}`,
    )
  }
}
