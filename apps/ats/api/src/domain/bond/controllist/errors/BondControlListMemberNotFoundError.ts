// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondControlListMemberNotFoundError extends EntityNotFoundError {
  static contractIdAndHolderIdError(contractId: string, holderId: string): BondControlListMemberNotFoundError {
    return new BondControlListMemberNotFoundError(
      `Holder ${holderId} is not in the control list for contract ${contractId}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
