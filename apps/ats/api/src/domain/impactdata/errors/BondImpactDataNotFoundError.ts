// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondImpactDataNotFoundError extends EntityNotFoundError {
  static bondContractIdError(bondContractId: string): BondImpactDataNotFoundError {
    return new BondImpactDataNotFoundError(`Impact data configuration not found for bond ${bondContractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
