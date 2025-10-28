// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class TreasuryAlreadyPausedError extends DomainError {
  static forTreasury(treasuryContractId: string): TreasuryAlreadyPausedError {
    return new TreasuryAlreadyPausedError(`Treasury ${treasuryContractId} already paused.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
