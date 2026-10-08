// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondLockFoundError extends EntityFoundError {
  static lockIdError(bondContractId: string, id: number): BondLockFoundError {
    return new BondLockFoundError(`Lock with bondContractId ${bondContractId} and id ${id} already exists`)
  }
}
