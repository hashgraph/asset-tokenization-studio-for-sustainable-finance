import { Inject, RestController, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { PageResponse, QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionsByInvestorPort } from "./GetSubscriptionsByInvestorPort"
import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"
import { GetSubscriptionsByInvestorQuery } from "@app/subscription/getsubscriptionsbyinvestor/query/GetSubscriptionsByInvestorQuery"

@RestController("primary-markets")
export class GetSubscriptionsByInvestorHttpAdapter implements GetSubscriptionsByInvestorPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("investors/:investorAccountId/subscriptions")
  async getSubscriptionsByInvestor(
    @Param("investorAccountId") investorAccountId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<SubscriptionResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetSubscriptionsByInvestorQuery(investorAccountId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
