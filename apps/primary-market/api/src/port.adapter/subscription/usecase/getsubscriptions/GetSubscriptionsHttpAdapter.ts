// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { PageResponse, QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionsPort } from "./GetSubscriptionsPort"
import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"
import { GetSubscriptionsQuery } from "@app/subscription/getsubscriptions/query/GetSubscriptionsQuery"

@RestController("primary-markets")
export class GetSubscriptionsHttpAdapter implements GetSubscriptionsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":marketContractId/offerings/:offeringId/subscriptions")
  async getSubscriptions(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
    @Query() queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<SubscriptionResponse>> {
    const queryPageOptions = (queryPageRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetSubscriptionsQuery(marketContractId, offeringId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
