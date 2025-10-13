// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import { QueryBus } from "@nestjs/cqrs"
import { GetEnvironmentalAssetsQuery } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetQueryResponse } from "@app/environmentalasset/getenvironmentalassets/query/EnvironmentalAssetQueryResponse"

@RestController()
export class GetEnvironmentalAssetsHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets")
  async list(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<EnvironmentalAssetQueryResponse> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toPageOptions()
    const query = new GetEnvironmentalAssetsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
