// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"

export class RedemptionHolderNotFoundError extends EntityNotFoundError {
  private constructor(message: string) {
    super(message)
  }

  static treasuryIdAndholderAccountIdErrorAndStatus(
    treasuryId: string,
    holderAccountId: string,
    status: RedemptionHolderStatus,
  ): RedemptionHolderNotFoundError {
    return new RedemptionHolderNotFoundError(
      `Redemption holder for treasury id ${treasuryId} and holder account ${holderAccountId} in status ${status}` +
        " not found",
    )
  }
}
