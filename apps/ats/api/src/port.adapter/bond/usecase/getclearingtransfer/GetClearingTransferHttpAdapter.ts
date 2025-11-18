// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransferResponse } from "./model/ClearingTransferResponse"
import { Get, Param } from "@nestjs/common"
import { GetClearingTransferPort } from "./GetClearingTransferPort"
import { GetClearingTransferQuery } from "@app/bond/getclearingtransfer/query/GetClearingTransferQuery"

@RestController("bonds")
export class GetClearingTransferHttpAdapter implements GetClearingTransferPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/clearings/:clearingId/transfer")
  async getClearing(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
  ): Promise<ClearingTransferResponse> {
    return await this.queryBus.execute(new GetClearingTransferQuery(bondContractId, holderAccountId, clearingId))
  }
}
