// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import { Subscription } from "../model/Subscription"
import { SubscriptionNotFoundError } from "../errors/SubscriptionNotFoundError"

@Singleton()
export class CheckSubscriptionExistsDomainService {
  constructor(@Inject() private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(subscriptionId: string, offeringId: string, marketId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findBySubscriptionIdOfferingIdAndMarketId(
      subscriptionId,
      offeringId,
      marketId,
    )
    if (!subscription) {
      throw SubscriptionNotFoundError.subscriptionIdOfferingIdAndMarketIdError(subscriptionId, offeringId, marketId)
    }
    return subscription
  }
}
