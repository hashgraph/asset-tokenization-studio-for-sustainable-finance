// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondLocksPort } from "./GetBondLocksPort"
import { GetBondLocksQuery } from "@app/bond/getbondlocks/query/GetBondLocksQuery"
import { BondLocksResponse } from "./model/BondLocksResponse"

@RestController("bonds")
export class GetBondLocksHttpAdapter implements GetBondLocksPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/locks")
  async getBondLocks(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<BondLocksResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondLocksQuery(bondContractId, holderAccountId, queryPageOptions))
  }
}
