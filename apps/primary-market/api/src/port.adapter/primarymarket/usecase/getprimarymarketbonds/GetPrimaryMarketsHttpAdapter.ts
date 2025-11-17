// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketBondsPort } from "./GetPrimaryMarketsPort"
import { PrimaryMarketBondResponse } from "./model/PrimaryMarketBondResponse"
import { GetPrimaryMarketBondsQuery } from "@app/primarymarket/getprimarymarketbonds/query/GetPrimaryMarketBondsQuery"

@RestController("primary-markets")
export class GetPrimaryMarketBondsHttpAdapter implements GetPrimaryMarketBondsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

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
