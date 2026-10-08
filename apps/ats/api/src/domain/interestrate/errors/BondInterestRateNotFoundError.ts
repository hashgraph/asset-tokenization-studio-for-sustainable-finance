// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondInterestRateNotFoundError extends EntityNotFoundError {
  static bondContractIdError(bondContractId: string): BondInterestRateNotFoundError {
    return new BondInterestRateNotFoundError(`Interest rate configuration not found for bond ${bondContractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
