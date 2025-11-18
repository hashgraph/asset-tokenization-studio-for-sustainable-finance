// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetHolderBalancesPort } from "./GetHolderBalancesPort"
import { GetHolderBalancesQuery } from "@app/bond/getholderbalances/query/GetHolderBalancesQuery"
import { HolderBalancesResponse } from "./model/HolderBalancesResponse"

@RestController("bonds")
export class GetHolderBalancesHttpAdapter implements GetHolderBalancesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/balances")
  async getHolderBalances(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<HolderBalancesResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetHolderBalancesQuery(bondContractId, holderAccountId, queryPageOptions))
  }
}
