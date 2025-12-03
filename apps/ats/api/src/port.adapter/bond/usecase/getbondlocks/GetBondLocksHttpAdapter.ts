// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondLocksPort } from "./GetBondLocksPort"
import { GetBondLocksQuery } from "@app/bond/getbondlocks/query/GetBondLocksQuery"
import { BondLocksResponse } from "./model/BondLocksResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondLocksHttpAdapter implements GetBondLocksPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond locks for a specific holder" })
  @ApiResponse({ status: 200, type: BondLocksResponse, isArray: true })
  @Get(":bondContractId/holders/:holderAccountId/locks")
  async getBondLocks(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondLocksResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondLocksQuery(bondContractId, holderAccountId, queryPageOptions))
  }
}
