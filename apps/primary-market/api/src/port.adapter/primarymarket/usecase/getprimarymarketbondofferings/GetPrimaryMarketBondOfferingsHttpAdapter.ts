// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import {
  PageOptionsRequest,
  RestController,
  Inject,
  PageResponse,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketBondOfferingsPort } from "./GetPrimaryMarketBondOfferingsPort"
import { PrimaryMarketBondOfferingResponse } from "./model/PrimaryMarketBondOfferingResponse"
import { GetPrimaryMarketBondOfferingsQuery } from "@app/primarymarket/getprimarymarketbondofferings/query/GetPrimaryMarketBondOfferingsQuery"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketBondOfferingsHttpAdapter implements GetPrimaryMarketBondOfferingsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all offerings for a specific bond in a primary market" })
  @ApiPaginatedResponse(PrimaryMarketBondOfferingResponse)
  @Get(":marketContractId/bonds/:bondContractId/offerings")
  async getPrimaryMarketBondOfferings(
    @Param("marketContractId") marketContractId: string,
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<PrimaryMarketBondOfferingResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetPrimaryMarketBondOfferingsQuery(marketContractId, bondContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
