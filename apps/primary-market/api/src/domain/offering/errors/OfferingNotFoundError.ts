// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class OfferingNotFoundError extends EntityNotFoundError {
  static offeringDltIdAndMarketContractIdError(offeringDltId: string, marketContractId: string): OfferingNotFoundError {
    return new OfferingNotFoundError(
      `Offering not found for offering dlt id: ${offeringDltId} and market contract id: ${marketContractId}.`,
    )
  }
}
