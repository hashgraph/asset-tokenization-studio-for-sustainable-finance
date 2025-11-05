// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Subscription } from "../model/Subscription"

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>
  findBySubscriptionIdOfferingIdAndMarketId(
    subscriptionId: string,
    offeringId: string,
    marketId: string,
  ): Promise<Subscription | null>
  saveAll(subscriptions: Subscription[]): Promise<Subscription[]>
  findByOfferingIdAndMarketId(
    offeringId: string,
    marketId: string,
    pageOptions: PageOptions,
  ): Promise<Page<Subscription>>
}
