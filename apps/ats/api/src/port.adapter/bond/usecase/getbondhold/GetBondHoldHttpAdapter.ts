// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, ParseIntPipe } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondHoldPort } from "./GetBondHoldPort"
import { GetBondHoldQuery } from "@app/bond/getbondhold/query/GetBondHoldQuery"
import { BondHoldResponse } from "./model/BondHoldResponse"

@RestController("bonds")
export class GetBondHoldHttpAdapter implements GetBondHoldPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/holds/:holdId")
  async getBondHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("holdId", ParseIntPipe) holdId: number,
  ): Promise<BondHoldResponse> {
    return await this.queryBus.execute(new GetBondHoldQuery(bondContractId, holderAccountId, holdId))
  }
}
