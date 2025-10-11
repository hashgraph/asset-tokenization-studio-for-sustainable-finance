// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, Page } from "@hashgraph/green-bonds-shared-core"
import { QueryBus } from "@nestjs/cqrs"
import { GetEnvironmentalAssetsQuery } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetQueryResponse } from "@app/environmentalasset/getenvironmentalassets/query/EnvironmentalAssetQueryResponse"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

@RestController()
export class GetEnvironmentalAssetsHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets")
  async list(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<EnvironmentalAssetQueryResponse> {
    const pageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toPageOptions()
    const page: Page<EnvironmentalAsset> = await this.queryBus.execute(
      new GetEnvironmentalAssetsQuery(treasuryContractId, pageOptions),
    )

    return EnvironmentalAssetQueryResponse.fromPage(page, (asset) => asset)
  }
}
