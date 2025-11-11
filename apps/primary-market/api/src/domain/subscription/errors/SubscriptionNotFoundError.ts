// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionNotFoundError extends EntityNotFoundError {
  static subscriptionDltIdOfferingDltIdAndMarketContractIdError(
    subscriptionDltId: string,
    offeringDltId: string,
    marketContractId: string,
  ): SubscriptionNotFoundError {
    return new SubscriptionNotFoundError(
      `Subscription with subscriptionDltId ${subscriptionDltId}, offeringDltId ${offeringDltId} and marketContractId ${marketContractId} not found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
