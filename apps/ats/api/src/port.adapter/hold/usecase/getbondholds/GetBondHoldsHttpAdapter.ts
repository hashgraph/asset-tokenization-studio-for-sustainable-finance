// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondHoldsPort } from "./GetBondHoldsPort"
import { GetBondHoldsQuery } from "@app/hold/getbondholds/query/GetBondHoldsQuery"
import { BondHoldsResponse } from "./model/BondHoldsResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondHoldsHttpAdapter implements GetBondHoldsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond holds for a specific holder" })
  @ApiResponse({ status: 200, type: BondHoldsResponse, isArray: true })
  @Get(":bondContractId/holders/:holderAccountId/holds")
  async getBondHolds(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondHoldsResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondHoldsQuery(bondContractId, holderAccountId, queryPageOptions))
  }
}
