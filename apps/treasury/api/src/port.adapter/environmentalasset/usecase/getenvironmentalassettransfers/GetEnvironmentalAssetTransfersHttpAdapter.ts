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
import { GetEnvironmentalAssetTransfersQuery } from "@app/environmentalasset/getenvironmentalassettransfers/query/GetEnvironmentalAssetTransfersQuery"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"
import { GetEnvironmentalAssetTransfersPort } from "./GetEnvironmentalAssetTransfersPort"
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetEnvironmentalAssetTransfersHttpAdapter implements GetEnvironmentalAssetTransfersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary:
      "Returns info about inflows and outflows transfer that have been executed " +
      "for a specific environmental asset",
  })
  @ApiPaginatedResponse(EnvironmentalAssetTransferResponse)
  @ApiQuery({ name: "type", enum: ["INFLOW", "OUTFLOW"], required: false })
  @Get(":treasuryId/environmental-assets/:assetId/transfers")
  async getEnvironmentalAssetTransfers(
    @Param("treasuryId") treasuryContractId: string,
    @Param("assetId") environmentalAssetContractId: string,
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
