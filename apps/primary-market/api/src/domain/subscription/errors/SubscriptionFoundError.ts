// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionFoundError extends EntityFoundError {
  static subscriptionDltIdOfferingDltIdAndMarketContractIdError(
    subscriptionDltId: string,
    offeringDltId: string,
    marketContractId: string,
  ): SubscriptionFoundError {
    return new SubscriptionFoundError(
      `Subscription with subscriptionDltId ${subscriptionDltId}, offeringDltId ${offeringDltId} and marketContractId ${marketContractId} found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
