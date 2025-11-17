// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddProceedRecipientTransactionRequest } from "./model/AddProceedRecipientTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { AddProceedRecipientTransactionAppService } from "@app/bond/transaction/addproceedrecipienttransaction/service/AddProceedRecipientTransactionAppService"
import { AddProceedRecipientTransactionAppServiceRequest } from "@app/bond/transaction/addproceedrecipienttransaction/service/model/AddProceedRecipientTransactionAppServiceRequest"

@RestController("bonds")
export class AddProceedRecipientTransactionHttpAdapter {
  constructor(private readonly addProceedRecipientTransactionAppService: AddProceedRecipientTransactionAppService) {}

  @Post(":bondContractId/proceeds-recipients")
  async addProceedRecipientTransaction(
    @Param("bondContractId") contractId: string,
    @Body() request: AddProceedRecipientTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new AddProceedRecipientTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      request.proceedRecipientAddress,
      request.data,
    )

    return await this.addProceedRecipientTransactionAppService.execute(appServiceRequest)
  }
}
