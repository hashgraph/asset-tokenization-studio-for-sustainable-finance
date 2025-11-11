// SPDX-License-Identifier: Apache-2.0

import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"

export interface GetSubscriptionPort {
  getSubscription(
    marketContractId: string,
    offeringDltId: string,
    subscriptionDltId: string,
  ): Promise<SubscriptionResponse>
}
