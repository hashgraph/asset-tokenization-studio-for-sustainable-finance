// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { Page, PageOptionsRequest, PageResponse, RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetsQuery } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetResponse } from "./model/EnvironmentalAssetResponse"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

@RestController()
export class GetEnvironmentalAssetsHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets")
  async list(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<EnvironmentalAssetResponse>> {
    const page: Page<EnvironmentalAsset> = await this.queryBus.execute(
      new GetEnvironmentalAssetsQuery(
        treasuryContractId,
        pageOptionsRequest?.toPageOptions?.() ?? PageOptionsRequest.DEFAULT.toPageOptions(),
      ),
    )
    return PageResponse.fromPage<EnvironmentalAsset, EnvironmentalAssetResponse>(page, (asset) => ({
      contractId: asset.contractId,
      validityDate: asset.validityDate ?? null,
    }))
  }
}
