// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { Subscription } from "../model/Subscription"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckSubscriptionExistsDomainService } from "./CheckSubscriptionExistsDomainService"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"

@Singleton()
export class UpdateSubscriptionsStatusDomainService {
  constructor(private readonly checkSubscriptionExistsDomainService: CheckSubscriptionExistsDomainService) {}

  async execute(
    subscriptionIds: number[],
    offeringId: number,
    market: PrimaryMarket,
    status: SubscriptionStatus,
  ): Promise<Subscription[]> {
    const updated: Subscription[] = []

    for (const subscriptionId of subscriptionIds) {
      const subscription = await this.checkSubscriptionExistsDomainService.execute(subscriptionId, offeringId, market)
      subscription.status = status
      subscription.updatedAt = new Date()
      updated.push(subscription)
    }

    return updated
  }
}
