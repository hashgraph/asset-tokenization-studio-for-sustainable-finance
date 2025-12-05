// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondLockNotFoundError extends EntityNotFoundError {
  static lockIdError(bondContractId: string, lockId: number): BondLockNotFoundError {
    return new BondLockNotFoundError(`Bond lock with lockId ${lockId} not found for bond contract ${bondContractId}`)
  }
}
