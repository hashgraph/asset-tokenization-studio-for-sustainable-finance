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
import { GetDistributionHoldersQuery } from "@app/distribution/getdistributionholders/query/GetDistributionHoldersQuery"
import { DistributionHolderResponse } from "./model/DistributionHolderResponse"
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetDistributionHoldersHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Returns for a distribution Id paginated holders with their status and paid amount" })
  @ApiPaginatedResponse(DistributionHolderResponse)
  @ApiQuery({ name: "status", enum: ["SUCCESS", "FAILED"], required: false })
  @Get(":treasuryId/distributions/:distributionId")
  async getDistributionHolders(
    @Param("treasuryId") treasuryContractId: string,
    @Param("distributionId") distributionId: number,
    @Query() pageOptionsRequest: PageOptionsRequest,
    @Query("status") status?: string,
  ): Promise<PageResponse<DistributionHolderResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetDistributionHoldersQuery(treasuryContractId, distributionId, queryPageOptions, status)

    return await this.queryBus.execute(query)
  }
}
