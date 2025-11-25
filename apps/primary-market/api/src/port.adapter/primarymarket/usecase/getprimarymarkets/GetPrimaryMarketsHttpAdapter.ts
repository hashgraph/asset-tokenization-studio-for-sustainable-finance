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
import { GetPrimaryMarketsPort } from "./GetPrimaryMarketsPort"
import { PrimaryMarketResponse } from "@port/primarymarket/shared/model/PrimaryMarketResponse"
import { GetPrimaryMarketsQuery } from "@app/primarymarket/getprimarymarkets/query/GetPrimaryMarketsQuery"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketsHttpAdapter implements GetPrimaryMarketsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all primary markets" })
  @ApiPaginatedResponse(PrimaryMarketResponse)
  @Get()
  async getPrimaryMarkets(
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<PrimaryMarketResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetPrimaryMarketsQuery(queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
