// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondAlreadyUnpausedError extends DomainError {
  static contractIdError(contractId: string): BondAlreadyUnpausedError {
    return new BondAlreadyUnpausedError(`Bond ${contractId} already unpaused.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
