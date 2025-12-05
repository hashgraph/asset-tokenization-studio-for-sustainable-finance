// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, ParseIntPipe } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondHoldPort } from "./GetBondHoldPort"
import { GetBondHoldQuery } from "@app/hold/getbondhold/query/GetBondHoldQuery"
import { BondHoldResponse } from "./model/BondHoldResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondHoldHttpAdapter implements GetBondHoldPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond hold details by holder, partition and hold ID" })
  @ApiResponse({ status: 200, type: BondHoldResponse })
  @Get(":bondContractId/holders/:holderAccountId/partitions/:partition/holds/:holdId")
  async getBondHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("partition") partition: string,
    @Param("holdId", ParseIntPipe) holdId: number,
  ): Promise<BondHoldResponse> {
    return await this.queryBus.execute(new GetBondHoldQuery(bondContractId, holderAccountId, holdId, partition))
  }
}
