// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { FundProceedsRecipientTransactionRequest } from "./model/FundProceedsRecipientTransactionRequest"
import { FundProceedsRecipientTransactionAppService } from "../../../../app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { FundProceedsRecipientTransactionAppServiceRequest } from "../../../../app/transaction/fundproceedsrecipienttransaction/service/model/FundProceedsRecipientTransactionAppServiceRequest"

@RestController()
export class FundProceedsRecipientTransactionHttpAdapter {
  constructor(
    private readonly fundProceedsRecipientTransactionAppService: FundProceedsRecipientTransactionAppService,
  ) {}

  @Post(":treasuryId/proceeds-recipients/:recipientId/transfer")
  fundProceedsRecipient(
    @Param("treasuryId") treasuryId: string,
    @Param("recipientId") recipientId: string,
    @Body() request: FundProceedsRecipientTransactionRequest,
  ): TransactionResponse {
    return this.fundProceedsRecipientTransactionAppService.execute(
      new FundProceedsRecipientTransactionAppServiceRequest(
        recipientId,
        request.amount,
        request.format,
        request.accountId || "",
        treasuryId,
      ),
    )
  }
}
