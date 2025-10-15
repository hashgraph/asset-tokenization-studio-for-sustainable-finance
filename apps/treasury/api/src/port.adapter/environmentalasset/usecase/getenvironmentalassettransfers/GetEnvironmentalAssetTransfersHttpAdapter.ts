// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { QueryBus } from "@nestjs/cqrs"
import { GetEnvironmentalAssetTransfersQuery } from "@app/environmentalasset/getenvironmentalassettransfers/query/GetEnvironmentalAssetTransfersQuery"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"
import { GetEnvironmentalAssetTransfersPort } from "./GetEnvironmentalAssetTransfersPort"

@RestController()
export class GetEnvironmentalAssetTransfersHttpAdapter implements GetEnvironmentalAssetTransfersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("environmental-assets/:environmentalAssetContractId/transfers")
  async getEnvironmentalAssetTransfers(
    @Param("environmentalAssetContractId") environmentalAssetContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetTransferResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetEnvironmentalAssetTransfersQuery(environmentalAssetContractId, queryPageOptions)
    return (await this.queryBus.execute(query)) as PageResponse<EnvironmentalAssetTransferResponse>
  }
}
