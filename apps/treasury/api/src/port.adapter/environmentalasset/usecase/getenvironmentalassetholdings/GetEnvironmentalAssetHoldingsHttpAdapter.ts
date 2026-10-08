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
import { GetEnvironmentalAssetHoldingsQuery } from "@app/environmentalasset/getenvironmentalassetholdings/query/GetEnvironmentalAssetHoldingsQuery"
import { EnvironmentalAssetHoldingsResponse } from "./model/EnvironmentalAssetHoldingsResponse"
import { GetEnvironmentalAssetHoldingsPort } from "./GetEnvironmentalAssetHoldingsPort"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetEnvironmentalAssetHoldingsHttpAdapter implements GetEnvironmentalAssetHoldingsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "List of all the NFTs the treasury owns for a specific environmental asset" })
  @ApiPaginatedResponse(EnvironmentalAssetHoldingsResponse)
  @Get(":treasuryId/environmental-assets/:assetId/holdings")
  async getEnvironmentalAssetHoldings(
    @Param("treasuryId") treasuryContractId: string,
    @Param("assetId") assetContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<EnvironmentalAssetHoldingsResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetEnvironmentalAssetHoldingsQuery(treasuryContractId, assetContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
