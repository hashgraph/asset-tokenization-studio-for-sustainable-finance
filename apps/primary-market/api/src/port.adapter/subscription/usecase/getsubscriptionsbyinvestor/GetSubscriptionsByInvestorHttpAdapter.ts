// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageOptionsRequest, ApiPaginatedResponse } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { PageResponse, QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionsByInvestorPort } from "./GetSubscriptionsByInvestorPort"
import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"
import { GetSubscriptionsByInvestorQuery } from "@app/subscription/getsubscriptionsbyinvestor/query/GetSubscriptionsByInvestorQuery"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetSubscriptionsByInvestorHttpAdapter implements GetSubscriptionsByInvestorPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all subscriptions for a specific investor" })
  @ApiPaginatedResponse(SubscriptionResponse)
  @Get("investors/:investorAccountId/subscriptions")
  async getSubscriptionsByInvestor(
    @Param("investorAccountId") investorAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<SubscriptionResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetSubscriptionsByInvestorQuery(investorAccountId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
