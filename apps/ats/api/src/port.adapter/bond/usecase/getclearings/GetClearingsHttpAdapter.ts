// SPDX-License-Identifier: Apache-2.0
import { Inject, PageResponse, RestController, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { GetClearingsPort } from "./GetClearingsPort"
import { GetHoldClearingsQuery } from "@app/bond/getclearings/query/GetHoldClearingsQuery"
import { ClearingQueryResponse } from "@app/bond/getclearings/query/ClearingHoldQueryResponse"

@RestController("bonds")
export class GetClearingsHttpAdapter implements GetClearingsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/clearings")
  async getClearings(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<ClearingQueryResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetHoldClearingsQuery(bondContractId, holderAccountId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
