// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class TreasuryAlreadyUnpausedError extends DomainError {
  static forTreasury(treasuryContractId: string): TreasuryAlreadyUnpausedError {
    return new TreasuryAlreadyUnpausedError(`Treasury ${treasuryContractId} already unpaused.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
