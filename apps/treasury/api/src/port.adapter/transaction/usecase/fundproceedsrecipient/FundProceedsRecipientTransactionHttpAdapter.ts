// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { FundProceedsRecipientTransactionRequest } from "./model/FundProceedsRecipientTransactionRequest"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { FundProceedsRecipientTransactionAppServiceRequest } from "@app/transaction/fundproceedsrecipienttransaction/service/model/FundProceedsRecipientTransactionAppServiceRequest"
import { FundProceedsRecipientTransactionPort } from "@port/transaction/usecase/fundproceedsrecipient/FundProceedsRecipientTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class FundProceedsRecipientTransactionHttpAdapter implements FundProceedsRecipientTransactionPort {
  constructor(
    private readonly fundProceedsRecipientTransactionAppService: FundProceedsRecipientTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Transfers to proceeds recipients" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/proceeds-recipients/:recipientId/transfer")
  async fundProceedsRecipient(
    @Param("treasuryId") treasuryContractId: string,
    @Param("recipientId") recipientContractId: string,
    @Body() request: FundProceedsRecipientTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.fundProceedsRecipientTransactionAppService.execute(
      new FundProceedsRecipientTransactionAppServiceRequest(
        recipientContractId,
        request.amount,
        request.format,
        request.accountId || "",
        treasuryContractId,
      ),
    )
  }
}
