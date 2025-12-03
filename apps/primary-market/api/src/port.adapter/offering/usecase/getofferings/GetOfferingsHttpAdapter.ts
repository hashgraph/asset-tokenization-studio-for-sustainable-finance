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
import { GetOfferingsPort } from "./GetOfferingsPort"
import { OfferingResponse } from "@port/shared/model/OfferingResponse"
import { GetOfferingsQuery } from "@app/offering/getofferings/query/GetOfferingsQuery"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetOfferingsHttpAdapter implements GetOfferingsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all offerings for a primary market" })
  @ApiPaginatedResponse(OfferingResponse)
  @Get(":marketContractId/offerings")
  async getOfferings(
    @Param("marketContractId") marketContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<OfferingResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetOfferingsQuery(marketContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
