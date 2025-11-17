// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetsQuery } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetResponse } from "./model/EnvironmentalAssetResponse"
import { GetEnvironmentalAssetsPort } from "./GetEnvironmentalAssetsPort"

@RestController("treasuries")
export class GetEnvironmentalAssetsHttpAdapter implements GetEnvironmentalAssetsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets")
  async getEnvironmentalAssets(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<EnvironmentalAssetResponse>> {
    const queryPageOptions = (queryPageRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetEnvironmentalAssetsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
