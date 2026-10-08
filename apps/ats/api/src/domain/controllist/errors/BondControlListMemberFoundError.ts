// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondControlListMemberFoundError extends EntityFoundError {
  static contractIdAndHolderAccountIdError(
    bondContractId: string,
    holderAccountId: string,
  ): BondControlListMemberFoundError {
    return new BondControlListMemberFoundError(
      `Holder ${holderAccountId} is already in the control list for contract ${bondContractId}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
