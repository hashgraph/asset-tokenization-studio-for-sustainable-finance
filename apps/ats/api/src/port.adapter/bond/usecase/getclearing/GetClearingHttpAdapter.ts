// SPDX-License-Identifier: Apache-2.0
import {Inject, RestController} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetClearingResponse } from "./model/GetClearingResponse"
import { Get, Param } from "@nestjs/common"
import { GetClearingPort } from "./GetClearingPort"
import { GetClearingQuery } from "@app/bond/getclearing/query/GetClearingQuery"

@RestController("bonds")
export class GetClearingHttpAdapter implements GetClearingPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/clearings/:clearingId")
  async getClearing(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
  ): Promise<GetClearingResponse> {
    const clearing = (await this.queryBus.execute(
      new GetClearingQuery(bondContractId, holderAccountId, clearingId),
    )) as any

    return new GetClearingResponse(clearing)
  }
}
