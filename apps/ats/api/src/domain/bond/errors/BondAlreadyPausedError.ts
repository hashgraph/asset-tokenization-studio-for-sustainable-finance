// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondAlreadyPausedError extends DomainError {
  static contractIdError(contractId: string): BondAlreadyPausedError {
    return new BondAlreadyPausedError(`Bond ${contractId} already paused.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
