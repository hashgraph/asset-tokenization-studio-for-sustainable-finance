// SPDX-License-Identifier: Apache-2.0
import { Inject, PageResponse, RestController, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { GetClearingsRedeemPort } from "./GetClearingsRedeemPort"
import { GetClearingsRedeemQuery } from "@app/bond/getclearingsredeem/query/GetClearingsRedeemQuery"
import { ClearingRedeemResponse } from "@port/bond/usecase/getclearingsredeem/model/ClearingRedeemResponse"

@RestController("bonds")
export class GetClearingsRedeemHttpAdapter implements GetClearingsRedeemPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

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
