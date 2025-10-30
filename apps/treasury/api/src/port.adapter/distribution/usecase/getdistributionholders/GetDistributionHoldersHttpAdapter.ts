// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetDistributionHoldersQuery } from "@app/distribution/getdistributionholders/query/GetDistributionHoldersQuery"
import { DistributionHolderResponse } from "./model/DistributionHolderResponse"

@RestController("treasuries")
export class GetDistributionHoldersHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/distributions/:distributionId/holders")
  async getDistributionHolders(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("distributionId") distributionId: number,
    @Query() queryPageRequest: QueryPageRequest,
    @Query("status") status?: string,
  ): Promise<PageResponse<DistributionHolderResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetDistributionHoldersQuery(treasuryContractId, distributionId, queryPageOptions, status)

    return await this.queryBus.execute(query)
  }
}
