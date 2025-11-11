// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondDocumentNotFoundError extends EntityNotFoundError {
  private constructor(message: string) {
    super(message)
  }

  static contractIdNameError(contractId: string, name: string): BondDocumentNotFoundError {
    return new BondDocumentNotFoundError(`Bond document with name ${name} not found for contract ${contractId}`)
  }
}
