// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveProceedRecipientTransactionRequest } from "./model/RemoveProceedRecipientTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { RemoveProceedRecipientTransactionAppService } from "@app/bond/removeproceedrecipient/transaction/RemoveProceedRecipientTransactionAppService"
import { RemoveProceedRecipientTransactionAppServiceRequest } from "@app/bond/removeproceedrecipient/transaction/RemoveProceedRecipientTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class RemoveProceedRecipientTransactionHttpAdapter {
  constructor(
    private readonly removeProceedRecipientTransactionAppService: RemoveProceedRecipientTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Remove proceed recipient from bond" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/proceeds-recipients")
  async removeProceedRecipientTransaction(
    @Param("bondContractId") contractId: string,
    @Body() request: RemoveProceedRecipientTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new RemoveProceedRecipientTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      request.proceedRecipientAddress,
    )

    return await this.removeProceedRecipientTransactionAppService.execute(appServiceRequest)
  }
}
