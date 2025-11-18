// SPDX-License-Identifier: Apache-2.0
import { Inject, PageResponse, RestController, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { GetClearingsHoldPort } from "./GetClearingsHoldPort"
import { GetClearingsHoldQuery } from "@app/bond/getclearingshold/query/GetClearingsHoldQuery"
import { ClearingHoldResponse } from "@port/bond/usecase/getclearingshold/model/ClearingHoldResponse"

@RestController("bonds")
export class GetClearingsHoldHttpAdapter implements GetClearingsHoldPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

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
