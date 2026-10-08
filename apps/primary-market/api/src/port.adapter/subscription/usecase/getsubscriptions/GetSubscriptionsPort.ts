// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"

export interface GetSubscriptionsPort {
  getSubscriptions(
    marketContractId: string,
    offeringId: number,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<SubscriptionResponse>>
}
