// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionNotFoundError extends EntityNotFoundError {
  static subscriptionIdError(subscriptionId: string): SubscriptionNotFoundError {
    return new SubscriptionNotFoundError(`Subscription with subscriptionId ${subscriptionId} not found.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
