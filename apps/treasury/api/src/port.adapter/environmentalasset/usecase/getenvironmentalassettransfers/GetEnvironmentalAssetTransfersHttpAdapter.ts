// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetTransfersQuery } from "@app/environmentalasset/getenvironmentalassettransfers/query/GetEnvironmentalAssetTransfersQuery"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"
import { GetEnvironmentalAssetTransfersPort } from "./GetEnvironmentalAssetTransfersPort"

@RestController("treasuries")
export class GetEnvironmentalAssetTransfersHttpAdapter implements GetEnvironmentalAssetTransfersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/environmental-assets/:environmentalAssetContractId/transfers")
  async getEnvironmentalAssetTransfers(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("environmentalAssetContractId") environmentalAssetContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
    @Query("type") type?: string,
  ): Promise<PageResponse<EnvironmentalAssetTransferResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()

    const query = new GetEnvironmentalAssetTransfersQuery(
      treasuryContractId,
      environmentalAssetContractId,
      type,
      queryPageOptions,
    )
    return await this.queryBus.execute(query)
  }
}
