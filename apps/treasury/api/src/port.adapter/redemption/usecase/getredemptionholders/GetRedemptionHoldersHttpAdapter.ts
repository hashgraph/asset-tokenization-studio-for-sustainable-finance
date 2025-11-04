// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetRedemptionHoldersQuery } from "@app/redemption/getredemptionholders/query/GetRedemptionHoldersQuery"
import { RedemptionHolderResponse } from "./model/RedemptionHolderResponse"

@RestController("treasuries")
export class GetRedemptionHoldersHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/redemptions")
  async getRedemptionHolders(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
    @Query("status") status?: string,
  ): Promise<PageResponse<RedemptionHolderResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRedemptionHoldersQuery(treasuryContractId, queryPageOptions, status)

    return await this.queryBus.execute(query)
  }
}
