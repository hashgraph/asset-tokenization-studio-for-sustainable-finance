// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketNotFoundError extends EntityNotFoundError {
  static contractIdError(contractId: string): PrimaryMarketNotFoundError {
    return new PrimaryMarketNotFoundError(`PrimaryMarket not found for contract id: ${contractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
