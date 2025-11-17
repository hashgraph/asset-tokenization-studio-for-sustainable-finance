// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetDistributionsQuery } from "@app/distribution/getdistributions/query/GetDistributionsQuery"
import { DistributionResponse } from "./model/DistributionResponse"
import { GetDistributionsPort } from "./GetDistributionsPort"

@RestController("treasuries")
export class GetDistributionsHttpAdapter implements GetDistributionsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/distributions")
  async getDistributions(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<DistributionResponse>> {
    const queryPageOptions = (queryPageRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetDistributionsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
