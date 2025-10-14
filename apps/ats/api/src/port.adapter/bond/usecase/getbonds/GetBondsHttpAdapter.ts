// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Query } from "@nestjs/common"
import { GetBondsPort } from "./GetBondsPort"
import { type QueryBus, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondsQuery } from "@app/bond/getbonds/query/GetBondsQuery"
import { BondQueryResponse } from "@app/bond/getbonds/query/BondQueryResponse"

@RestController("bonds")
export class GetBondsHttpAdapter implements GetBondsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  async getBonds(@Query() queryPageRequest: QueryPageRequest): Promise<BondQueryResponse> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toPageOptions()
    return await this.queryBus.execute(new GetBondsQuery(queryPageOptions))
  }
}
