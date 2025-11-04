// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionNotFoundError extends EntityNotFoundError {
  static subscriptionIdOfferingIdAndMarketIdError(
    subscriptionId: string,
    offeringId: string,
    marketId: string,
  ): SubscriptionNotFoundError {
    return new SubscriptionNotFoundError(
      `Subscription with subscriptionId ${subscriptionId}, offeringId ${offeringId} and marketId ${marketId} not found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
