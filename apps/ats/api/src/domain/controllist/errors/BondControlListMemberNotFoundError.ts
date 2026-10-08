// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondControlListMemberNotFoundError extends EntityNotFoundError {
  static contractIdAndHolderAccountIdError(
    bondContractId: string,
    holderAccountId: string,
  ): BondControlListMemberNotFoundError {
    return new BondControlListMemberNotFoundError(
      `Holder ${holderAccountId} is not in the control list for contract ${bondContractId}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
