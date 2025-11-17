// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketAlreadyPausedError extends DomainError {
  static contractIdError(contractId: string): PrimaryMarketAlreadyPausedError {
    return new PrimaryMarketAlreadyPausedError(`Primary Market ${contractId} already paused.`)
  }
}
