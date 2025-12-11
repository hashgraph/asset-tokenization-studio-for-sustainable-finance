// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddProceedRecipientTransactionRequest } from "./model/AddProceedRecipientTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { AddProceedRecipientTransactionAppService } from "@app/transaction/proceedrecipient/addproceedrecipienttransaction/service/AddProceedRecipientTransactionAppService"
import { AddProceedRecipientTransactionAppServiceRequest } from "@app/transaction/proceedrecipient/addproceedrecipienttransaction/service/model/AddProceedRecipientTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class AddProceedRecipientTransactionHttpAdapter {
  constructor(private readonly addProceedRecipientTransactionAppService: AddProceedRecipientTransactionAppService) {}

  @ApiOperation({ summary: "Add proceed recipient to bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/proceeds-recipients")
  async addProceedRecipientTransaction(
    @Param("bondContractId") bondContractId: string,
    @Body() request: AddProceedRecipientTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new AddProceedRecipientTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      request.proceedRecipientAddress,
      request.data,
    )

    return await this.addProceedRecipientTransactionAppService.execute(appServiceRequest)
  }
}
