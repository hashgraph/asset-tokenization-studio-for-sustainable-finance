// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import {
  PageOptionsRequest,
  RestController,
  Inject,
  PageResponse,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetDistributionsQuery } from "@app/distribution/getdistributions/query/GetDistributionsQuery"
import { DistributionResponse } from "./model/DistributionResponse"
import { GetDistributionsPort } from "./GetDistributionsPort"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetDistributionsHttpAdapter implements GetDistributionsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Returns list of all distributions executed for a treasury" })
  @ApiPaginatedResponse(DistributionResponse)
  @Get(":treasuryId/distributions")
  async getDistributions(
    @Param("treasuryId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<DistributionResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetDistributionsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
