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
import { GetRedemptionHoldersQuery } from "@app/redemption/getredemptionholders/query/GetRedemptionHoldersQuery"
import { RedemptionHolderResponse } from "./model/RedemptionHolderResponse"
import { GetRedemptionHoldersPort } from "./GetRedemptionHoldersPort"
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetRedemptionHoldersHttpAdapter implements GetRedemptionHoldersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Returns redemption holders with their status" })
  @ApiPaginatedResponse(RedemptionHolderResponse)
  @ApiQuery({ name: "status", enum: ["SUCCESS", "FAILED"], required: false })
  @Get(":treasuryId/redemptions")
  async getRedemptionHolders(
    @Param("treasuryId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
    @Query("status") status?: string,
  ): Promise<PageResponse<RedemptionHolderResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRedemptionHoldersQuery(treasuryContractId, queryPageOptions, status)

    return await this.queryBus.execute(query)
  }
}
