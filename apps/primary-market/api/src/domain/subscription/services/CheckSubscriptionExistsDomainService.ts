// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import { Subscription } from "../model/Subscription"
import { SubscriptionNotFoundError } from "../errors/SubscriptionNotFoundError"
import { Offering } from "@domain/offering/model/Offering"

@Singleton()
export class CheckSubscriptionExistsDomainService {
  constructor(@Inject() private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(subscriptionId: string, offering: Offering): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findBySubscriptionIdAndOfferingId(
      subscriptionId,
      offering.id,
    )
    if (!subscription) {
      throw SubscriptionNotFoundError.subscriptionIdOfferingIdAndMarketContractIdError(
        subscriptionId,
        offering.offeringId,
        offering.market.contractId,
      )
    }
    return subscription
  }
}
