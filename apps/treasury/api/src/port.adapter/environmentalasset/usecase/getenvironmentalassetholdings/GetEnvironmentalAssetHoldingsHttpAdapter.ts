// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetHoldingsQuery } from "@app/environmentalasset/getenvironmentalassetholdings/query/GetEnvironmentalAssetHoldingsQuery"
import { EnvironmentalAssetHoldingsResponse } from "./model/EnvironmentalAssetHoldingsResponse"
import { GetEnvironmentalAssetHoldingsPort } from "./GetEnvironmentalAssetHoldingsPort"

@RestController("treasuries")
export class GetEnvironmentalAssetHoldingsHttpAdapter implements GetEnvironmentalAssetHoldingsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets/:assetContractId/holdings")
  async getEnvironmentalAssetHoldings(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("assetContractId") assetContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetHoldingsResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetEnvironmentalAssetHoldingsQuery(treasuryContractId, assetContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
