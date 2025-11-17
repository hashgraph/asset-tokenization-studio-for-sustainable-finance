// SPDX-License-Identifier: Apache-2.0

import { Inject, PageResponse, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Query } from "@nestjs/common"
import { GetBondsPort } from "./GetBondsPort"
import { type QueryBus, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondsQuery } from "@app/bond/getbonds/query/GetBondsQuery"
import { BondResponse } from "./model/BondResponse"

@RestController("bonds")
export class GetBondsHttpAdapter implements GetBondsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  async getBonds(@Query() pageOptionsRequest: PageOptionsRequest): Promise<PageResponse<BondResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetBondsQuery(queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
