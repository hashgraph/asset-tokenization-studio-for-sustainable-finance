// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionFoundError extends EntityFoundError {
  static subscriptionIdOfferingIdAndMarketIdError(
    subscriptionId: string,
    offeringId: string,
    marketId: string,
  ): SubscriptionFoundError {
    return new SubscriptionFoundError(
      `Subscription with subscriptionId ${subscriptionId}, offeringId ${offeringId} and marketId ${marketId} found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
