// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class DistributionHolderNotFoundError extends EntityNotFoundError {
  private constructor(message: string) {
    super(message)
  }

  static distributionIdAndHolderAccountIdError(
    distributionId: number,
    holderAccountId: string,
  ): DistributionHolderNotFoundError {
    return new DistributionHolderNotFoundError(
      `Distribution holder for distribution id ${distributionId} and holder account ${holderAccountId} not found`,
    )
  }
}
