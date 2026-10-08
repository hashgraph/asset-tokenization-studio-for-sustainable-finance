// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketPort } from "./GetPrimaryMarketPort"
import { PrimaryMarketResponse } from "@port/primarymarket/shared/model/PrimaryMarketResponse"
import { GetPrimaryMarketQuery } from "@app/primarymarket/getprimarymarket/query/GetPrimaryMarketQuery"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketHttpAdapter implements GetPrimaryMarketPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets a specific primary market by contract ID" })
  @Get(":marketContractId")
  async getPrimaryMarket(@Param("marketContractId") marketContractId: string): Promise<PrimaryMarketResponse> {
    const query = new GetPrimaryMarketQuery(marketContractId)
    return await this.queryBus.execute(query)
  }
}
