// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondControlListMemberFoundError extends EntityFoundError {
  static contractIdAndHolderIdError(contractId: string, holderId: string): BondControlListMemberFoundError {
    return new BondControlListMemberFoundError(
      `Holder ${holderId} is already in the control list for contract ${contractId}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
