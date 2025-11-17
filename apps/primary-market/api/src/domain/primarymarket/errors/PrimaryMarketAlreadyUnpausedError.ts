// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketAlreadyUnpausedError extends DomainError {
  static contractIdError(contractId: string): PrimaryMarketAlreadyUnpausedError {
    return new PrimaryMarketAlreadyUnpausedError(`Primary Market ${contractId} already unpaused.`)
  }
}
