// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import { Subscription } from "../model/Subscription"
import { SubscriptionNotFoundError } from "../errors/SubscriptionNotFoundError"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"

@Singleton()
export class CheckSubscriptionExistsDomainService {
  constructor(@Inject() private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(subscriptionId: number, offeringId: number, market: PrimaryMarket): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findBySubscriptionIdAndOfferingIdAndMarketId(
      subscriptionId,
      offeringId,
      market.id,
    )
    if (!subscription) {
      throw SubscriptionNotFoundError.subscriptionIdOfferingIdAndMarketContractIdError(
        subscriptionId,
        offeringId,
        market.contractId,
      )
    }
    return subscription
  }
}
