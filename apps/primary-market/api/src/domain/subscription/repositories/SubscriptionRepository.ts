// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Subscription } from "../model/Subscription"

export interface SubscriptionRepository {
  save(subscription: Subscription, transactionId?: string): Promise<Subscription>
  findBySubscriptionIdOfferingIdAndMarketId(
    subscriptionId: number,
    offeringId: number,
    marketId: string,
  ): Promise<Subscription | null>
  findByOfferingIdAndMarketId(
    offeringId: number,
    marketId: string,
    pageOptions: PageOptions,
  ): Promise<Page<Subscription>>
  findByInvestorAccountId(investorAccountId: string, pageOptions: PageOptions): Promise<Page<Subscription>>
}
