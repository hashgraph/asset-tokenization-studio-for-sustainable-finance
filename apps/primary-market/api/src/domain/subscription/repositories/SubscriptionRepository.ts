// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Subscription } from "../model/Subscription"

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>
  findBySubscriptionDltIdAndOfferingId(subscriptionDltId: string, offeringId: string): Promise<Subscription | null>
  saveAll(subscriptions: Subscription[]): Promise<Subscription[]>
  findByOfferingId(offeringId: string, pageOptions: PageOptions): Promise<Page<Subscription>>
  findByInvestorAccountId(investorAccountId: string, pageOptions: PageOptions): Promise<Page<Subscription>>
}
