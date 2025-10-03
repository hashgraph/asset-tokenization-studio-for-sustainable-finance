// SPDX-License-Identifier: Apache-2.0

import { GetTreasuryPositionsPort } from "@port/treasury/usecase/gettreasurypositions/GetTreasuryPositionsPort"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuryPositionsQuery } from "@app/treasury/gettreasurypositions/query/GetTreasuryPositionsQuery"
import { GetTreasuryPositionsResponse } from "@port/treasury/usecase/gettreasurypositions/model/GetTreasuryPositionsResponse"

@RestController("bonds")
export class GetTreasuryPositionsHttpAdapter implements GetTreasuryPositionsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractAddress/positions")
  async getTreasuryPositions(
    @Param("bondContractAddress") bondContractAddress: string,
  ): Promise<GetTreasuryPositionsResponse> {
    return await this.queryBus.execute(new GetTreasuryPositionsQuery(bondContractAddress))
  }
}
