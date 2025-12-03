// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeemResponse } from "./model/ClearingRedeemResponse"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetClearingRedeemPort } from "./GetClearingRedeemPort"
import { GetClearingRedeemQuery } from "@app/bond/getclearingredeem/query/GetClearingRedeemQuery"

@ApiTags("ATS")
@RestController("bonds")
export class GetClearingRedeemHttpAdapter implements GetClearingRedeemPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get clearing redeem details" })
  @ApiResponse({ status: 200, type: ClearingRedeemResponse })
  @Get(":bondContractId/holders/:holderAccountId/clearings/:clearingId/redeem")
  async getClearing(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
  ): Promise<ClearingRedeemResponse> {
    return await this.queryBus.execute(new GetClearingRedeemQuery(bondContractId, holderAccountId, clearingId))
  }
}
