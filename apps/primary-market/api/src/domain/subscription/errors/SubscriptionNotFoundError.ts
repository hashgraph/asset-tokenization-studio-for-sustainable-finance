// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionNotFoundError extends EntityNotFoundError {
  static subscriptionIdAndOfferingIdError(subscriptionId: string, offeringId: string): SubscriptionNotFoundError {
    return new SubscriptionNotFoundError(
      `Subscription with subscriptionId ${subscriptionId} and offeringId ${offeringId} not found.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
