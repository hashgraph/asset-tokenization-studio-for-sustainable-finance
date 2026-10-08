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
import { GetPrimaryMarketBondsPort } from "./GetPrimaryMarketBondsPort"
import { PrimaryMarketBondResponse } from "./model/PrimaryMarketBondResponse"
import { GetPrimaryMarketBondsQuery } from "@app/primarymarket/getprimarymarketbonds/query/GetPrimaryMarketBondsQuery"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketBondsHttpAdapter implements GetPrimaryMarketBondsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all bonds in a primary market" })
  @ApiPaginatedResponse(PrimaryMarketBondResponse)
  @Get(":marketContractId/bonds")
  async getPrimaryMarketBonds(
    @Param("marketContractId") marketContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<PrimaryMarketBondResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetPrimaryMarketBondsQuery(marketContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
