// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondHoldNotFoundError extends EntityNotFoundError {
  static holdIdError(bondContractId: string, holderAccountId: string, holdId: number): BondHoldNotFoundError {
    return new BondHoldNotFoundError(
      `Bond hold with id ${holdId} not found for holder ${holderAccountId} in bond ${bondContractId}`,
    )
  }
}
