// SPDX-License-Identifier: Apache-2.0

import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"

export interface GetSubscriptionPort {
  getSubscription(marketContractId: string, offeringId: number, subscriptionId: number): Promise<SubscriptionResponse>
}
