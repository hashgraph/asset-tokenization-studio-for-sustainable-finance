// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingTransactionRequest } from "./model/ExecuteOfferingTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ExecuteOfferingTransactionPort } from "./ExecuteOfferingTransactionPort"
import { ExecuteOfferingTransactionAppService } from "@app/transaction/executeoffering/service/ExecuteOfferingTransactionAppService"
import { ExecuteOfferingTransactionAppServiceRequest } from "@app/transaction/executeoffering/service/model/ExecuteOfferingTransactionAppServiceRequest"

@RestController("primary-markets")
export class ExecuteOfferingTransactionHttpAdapter implements ExecuteOfferingTransactionPort {
  constructor(private readonly executeOfferingTransactionAppService: ExecuteOfferingTransactionAppService) {}

  @Post(":marketContractId/offerings/:offeringId")
  async executeOfferingTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
    @Body() request: ExecuteOfferingTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ExecuteOfferingTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringId,
      request.start,
      request.end,
    )
    return await this.executeOfferingTransactionAppService.execute(appServiceRequest)
  }
}
