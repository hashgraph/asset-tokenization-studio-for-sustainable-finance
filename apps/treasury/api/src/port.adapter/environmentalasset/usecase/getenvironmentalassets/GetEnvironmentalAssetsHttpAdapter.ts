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
import { GetEnvironmentalAssetsQuery } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetResponse } from "./model/EnvironmentalAssetResponse"
import { GetEnvironmentalAssetsPort } from "./GetEnvironmentalAssetsPort"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetEnvironmentalAssetsHttpAdapter implements GetEnvironmentalAssetsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: "List of all environmental assets the treasury has had with their addition or removal date",
  })
  @ApiPaginatedResponse(EnvironmentalAssetResponse)
  @Get(":treasuryId/environmental-assets")
  async getEnvironmentalAssets(
    @Param("treasuryId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<EnvironmentalAssetResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetEnvironmentalAssetsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
