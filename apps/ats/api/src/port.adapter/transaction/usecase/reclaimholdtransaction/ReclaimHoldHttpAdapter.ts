// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReclaimHoldRequest } from "./model/ReclaimHoldRequest"
import { Body, Delete, Param, ParseIntPipe } from "@nestjs/common"
import { ReclaimHoldPort } from "./ReclaimHoldPort"
import { ReclaimHoldAppService } from "@app/bond/transaction/reclaimholdtransaction/service/ReclaimHoldAppService"
import { ReclaimHoldAppServiceRequest } from "@app/bond/transaction/reclaimholdtransaction/service/model/ReclaimHoldAppServiceRequest"

@RestController("bonds")
export class ReclaimHoldHttpAdapter implements ReclaimHoldPort {
  constructor(private readonly reclaimHoldAppService: ReclaimHoldAppService) {}

  @Delete(":bondContractId/holders/:holderAccountId/holds/:holdId/reclaim")
  async reclaimHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("holdId", ParseIntPipe) holdId: number,
    @Body() request: ReclaimHoldRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ReclaimHoldAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      holdId,
    )

    return await this.reclaimHoldAppService.execute(appServiceRequest)
  }
}
