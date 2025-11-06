// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class OfferingNotFoundError extends EntityNotFoundError {
  static offeringIdAndMarketContractIdError(offeringId: string, marketContractId: string): OfferingNotFoundError {
    return new OfferingNotFoundError(
      `Offering not found for offering id: ${offeringId} and market contract id: ${marketContractId}.`,
    )
  }
}
