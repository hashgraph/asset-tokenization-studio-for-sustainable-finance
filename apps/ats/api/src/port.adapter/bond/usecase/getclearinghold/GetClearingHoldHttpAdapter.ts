// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingHoldResponse } from "./model/ClearingHoldResponse"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetClearingHoldPort } from "./GetClearingHoldPort"
import { GetClearingHoldQuery } from "@app/bond/getclearinghold/query/GetClearingHoldQuery"

@ApiTags("ATS")
@RestController("bonds")
export class GetClearingHoldHttpAdapter implements GetClearingHoldPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get clearing hold details" })
  @ApiResponse({ status: 200, type: ClearingHoldResponse })
  @Get(":bondContractId/holders/:holderAccountId/clearings/:clearingId/hold")
  async getClearing(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
  ): Promise<ClearingHoldResponse> {
    return await this.queryBus.execute(new GetClearingHoldQuery(bondContractId, holderAccountId, clearingId))
  }
}
