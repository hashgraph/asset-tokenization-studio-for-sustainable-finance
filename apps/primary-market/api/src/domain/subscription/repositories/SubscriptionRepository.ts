// SPDX-License-Identifier: Apache-2.0

import { Subscription } from "../model/Subscription"

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>
  findBySubscriptionId(subscriptionId: string): Promise<Subscription | null>
  saveAll(subscriptions: Subscription[]): Promise<Subscription[]>
}
