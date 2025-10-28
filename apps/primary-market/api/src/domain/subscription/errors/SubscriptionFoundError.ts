// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionFoundError extends EntityFoundError {
  static subscriptionIdError(subscriptionId: string): SubscriptionFoundError {
    return new SubscriptionFoundError(`Subscription with subscriptionId ${subscriptionId} already exists.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
