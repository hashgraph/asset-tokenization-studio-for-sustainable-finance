// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class OfferingFoundError extends EntityFoundError {
  static offeringIdError(offeringId: string): OfferingFoundError {
    return new OfferingFoundError(`Offering with offeringId ${offeringId} already exists.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
