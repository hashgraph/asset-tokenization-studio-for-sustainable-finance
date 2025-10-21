// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import {
  QueryPageRequest,
  RestController,
  Inject,
  PageResponse,
  QueryPageResponse,
} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetsQuery } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetQueryResponse } from "@app/environmentalasset/getenvironmentalassets/query/EnvironmentalAssetQueryResponse"
import { EnvironmentalAssetResponse } from "./model/EnvironmentalAssetResponse"
import { GetEnvironmentalAssetsPort } from "./GetEnvironmentalAssetsPort"

@RestController("treasuries")
export class GetEnvironmentalAssetsHttpAdapter implements GetEnvironmentalAssetsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets")
  async getEnvironmentalAssets(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetEnvironmentalAssetsQuery(treasuryContractId, queryPageOptions)
    const result: QueryPageResponse<EnvironmentalAssetQueryResponse> = await this.queryBus.execute(query)
    return {
      ...result,
      items: result.items.map((item: EnvironmentalAssetQueryResponse) => ({
        ...item,
        removalDate: item.removalDate ?? null,
      })),
    }
  }
}
