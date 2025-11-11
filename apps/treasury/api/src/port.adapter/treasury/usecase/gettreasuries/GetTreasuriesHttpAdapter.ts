// SPDX-License-Identifier: Apache-2.0

import { Get, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuriesQuery } from "@app/treasury/gettreasuries/query/GetTreasuriesQuery"
import { TreasuryResponse } from "@port/treasury/usecase/gettreasuries/model/TreasuryResponse"
import { GetTreasuriesPort } from "@port/treasury/usecase/gettreasuries/GetTreasuriesPort"

@RestController("treasuries")
export class GetTreasuriesHttpAdapter implements GetTreasuriesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  async getTreasuries(@Query() queryPageRequest: QueryPageRequest): Promise<PageResponse<TreasuryResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetTreasuriesQuery(queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
