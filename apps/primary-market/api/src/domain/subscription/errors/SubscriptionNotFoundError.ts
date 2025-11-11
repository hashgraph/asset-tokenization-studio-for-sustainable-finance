// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionNotFoundError extends EntityNotFoundError {
  static subscriptionIdOfferingIdAndMarketContractIdError(
    subscriptionId: number,
    offeringId: number,
    marketContractId: string,
  ): SubscriptionNotFoundError {
    return new SubscriptionNotFoundError(
      `Subscription with subscriptionId ${subscriptionId}, offeringId ${offeringId} and marketContractId ${marketContractId} not found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
