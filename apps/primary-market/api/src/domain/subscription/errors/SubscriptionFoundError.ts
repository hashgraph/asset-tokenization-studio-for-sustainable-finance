// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionFoundError extends EntityFoundError {
  static subscriptionIdOfferingIdAndMarketContractIdError(
    subscriptionId: number,
    offeringId: number,
    marketContractId: string,
  ): SubscriptionFoundError {
    return new SubscriptionFoundError(
      `Subscription with subscriptionId ${subscriptionId}, offeringId ${offeringId} and marketContractId ${marketContractId} found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
