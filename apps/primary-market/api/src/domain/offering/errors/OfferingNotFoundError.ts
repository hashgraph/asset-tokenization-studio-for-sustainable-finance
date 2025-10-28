// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class OfferingNotFoundError extends EntityFoundError {
  static offeringIdError(offeringId: string): OfferingNotFoundError {
    return new OfferingNotFoundError(`Offering with offeringId ${offeringId} not found.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
