// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class OfferingNotFoundError extends EntityNotFoundError {
  static offeringIdAndMarketIdError(offeringId: string, marketId: string): OfferingNotFoundError {
    return new OfferingNotFoundError(`Offering with offeringId ${offeringId} and marketId ${marketId} not found.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
