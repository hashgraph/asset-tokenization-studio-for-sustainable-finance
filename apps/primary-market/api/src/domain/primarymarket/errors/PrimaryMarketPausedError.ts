// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketPausedError extends DomainError {
  static pausedError(contractId: string): PrimaryMarketPausedError {
    return new PrimaryMarketPausedError(`PrimaryMarket with contract id: ${contractId} is currently paused.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
