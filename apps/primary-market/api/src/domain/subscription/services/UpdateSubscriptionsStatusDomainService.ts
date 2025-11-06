// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { Subscription } from "../model/Subscription"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckSubscriptionExistsDomainService } from "./CheckSubscriptionExistsDomainService"
import { Offering } from "@domain/offering/model/Offering"

@Singleton()
export class UpdateSubscriptionsStatusDomainService {
  constructor(private readonly checkSubscriptionExistsDomainService: CheckSubscriptionExistsDomainService) {}

  async execute(subscriptionIds: string[], offering: Offering, status: SubscriptionStatus): Promise<Subscription[]> {
    const updated: Subscription[] = []

    for (const subscriptionId of subscriptionIds) {
      const subscription = await this.checkSubscriptionExistsDomainService.execute(subscriptionId, offering)
      subscription.status = status
      updated.push(subscription)
    }

    return updated
  }
}
