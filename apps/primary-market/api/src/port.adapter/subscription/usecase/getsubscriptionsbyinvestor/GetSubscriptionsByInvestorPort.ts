// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"

export interface GetSubscriptionsByInvestorPort {
  getSubscriptionsByInvestor(
    investorAccountId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<SubscriptionResponse>>
}
