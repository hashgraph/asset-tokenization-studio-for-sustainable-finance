// SPDX-License-Identifier: Apache-2.0
import { Inject, PageResponse, RestController, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetClearingsHoldPort } from "./GetClearingsHoldPort"
import { GetClearingsHoldQuery } from "@app/clearing/getclearingshold/query/GetClearingsHoldQuery"
import { ClearingHoldResponse } from "@port/clearing/usecase/getclearingshold/model/ClearingHoldResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetClearingsHoldHttpAdapter implements GetClearingsHoldPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get clearing holds for a holder" })
  @ApiResponse({ status: 200, type: ClearingHoldResponse, isArray: true })
  @Get(":bondContractId/holders/:holderAccountId/clearings/hold")
  async getClearingsHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ClearingHoldResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetClearingsHoldQuery(bondContractId, holderAccountId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
