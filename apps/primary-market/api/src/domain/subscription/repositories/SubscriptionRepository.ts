// SPDX-License-Identifier: Apache-2.0

import { Subscription } from "../model/Subscription"

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>
  findBySubscriptionIdAndOfferingId(subscriptionId: string, offeringId: string): Promise<Subscription | null>
  delete(subscription: Subscription): Promise<void>
  saveAll(subscriptions: Subscription[]): Promise<Subscription[]>
}
