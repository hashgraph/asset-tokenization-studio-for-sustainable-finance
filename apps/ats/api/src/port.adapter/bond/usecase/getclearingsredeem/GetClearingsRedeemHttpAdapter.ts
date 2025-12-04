// SPDX-License-Identifier: Apache-2.0
import { Inject, PageResponse, RestController, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetClearingsRedeemPort } from "./GetClearingsRedeemPort"
import { GetClearingsRedeemQuery } from "@app/bond/getclearingsredeem/query/GetClearingsRedeemQuery"
import { ClearingRedeemResponse } from "@port/bond/usecase/getclearingsredeem/model/ClearingRedeemResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetClearingsRedeemHttpAdapter implements GetClearingsRedeemPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get clearing redeems for a holder" })
  @ApiResponse({ status: 200, type: ClearingRedeemResponse, isArray: true })
  @Get(":bondContractId/holders/:holderAccountId/clearings/redeem")
  async getClearingsRedeem(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ClearingRedeemResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetClearingsRedeemQuery(bondContractId, holderAccountId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
