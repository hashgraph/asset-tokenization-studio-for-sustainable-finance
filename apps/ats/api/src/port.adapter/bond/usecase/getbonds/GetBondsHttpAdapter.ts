// SPDX-License-Identifier: Apache-2.0

import { Inject, PageResponse, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetBondsPort } from "./GetBondsPort"
import { type QueryBus, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondsQuery } from "@app/bond/getbonds/query/GetBondsQuery"
import { BondResponse } from "./model/BondResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondsHttpAdapter implements GetBondsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get all bonds" })
  @ApiResponse({ status: 200, type: BondResponse, isArray: true })
  @Get()
  async getBonds(@Query() pageOptionsRequest: PageOptionsRequest): Promise<PageResponse<BondResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetBondsQuery(queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
