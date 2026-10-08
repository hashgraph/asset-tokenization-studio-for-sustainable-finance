// SPDX-License-Identifier: Apache-2.0

import { Get, Query } from "@nestjs/common"
import {
  PageOptionsRequest,
  RestController,
  Inject,
  PageResponse,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuriesQuery } from "@app/treasury/gettreasuries/query/GetTreasuriesQuery"
import { TreasuryResponse } from "@port/treasury/usecase/gettreasuries/model/TreasuryResponse"
import { GetTreasuriesPort } from "@port/treasury/usecase/gettreasuries/GetTreasuriesPort"
import { ApiTags, ApiOperation } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetTreasuriesHttpAdapter implements GetTreasuriesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "List of all treasuries" })
  @ApiPaginatedResponse(TreasuryResponse)
  async getTreasuries(@Query() pageOptionsRequest: PageOptionsRequest): Promise<PageResponse<TreasuryResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetTreasuriesQuery(queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
