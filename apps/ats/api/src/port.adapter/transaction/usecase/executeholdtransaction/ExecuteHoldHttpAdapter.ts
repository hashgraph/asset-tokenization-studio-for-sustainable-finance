// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteHoldRequest } from "./model/ExecuteHoldRequest"
import { Body, Param, ParseIntPipe, Patch } from "@nestjs/common"
import { ExecuteHoldPort } from "./ExecuteHoldPort"
import { ExecuteHoldAppService } from "@app/bond/transaction/executeholdtransaction/service/ExecuteHoldAppService"
import { ExecuteHoldAppServiceRequest } from "@app/bond/transaction/executeholdtransaction/service/model/ExecuteHoldAppServiceRequest"

@RestController("bonds")
export class ExecuteHoldHttpAdapter implements ExecuteHoldPort {
  constructor(private readonly executeHoldAppService: ExecuteHoldAppService) {}

  @Patch(":bondContractId/holders/:holderAccountId/holds/:holdId")
  async executeHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("holdId", ParseIntPipe) holdId: number,
    @Body() request: ExecuteHoldRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ExecuteHoldAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      holdId,
      request.toAccountId,
      request.amount,
    )

    return await this.executeHoldAppService.execute(appServiceRequest)
  }
}
