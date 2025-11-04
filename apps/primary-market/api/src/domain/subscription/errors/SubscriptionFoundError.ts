// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionFoundError extends EntityFoundError {
  static subscriptionIdAndOfferingIdError(subscriptionId: string, offeringId: string): SubscriptionFoundError {
    return new SubscriptionFoundError(
      `Subscription with subscriptionId ${subscriptionId} and offeringId ${offeringId} already exists.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
