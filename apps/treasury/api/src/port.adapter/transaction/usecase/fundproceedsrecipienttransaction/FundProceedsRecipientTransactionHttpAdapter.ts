// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { FundProceedsRecipientTransactionRequest } from "./model/FundProceedsRecipientTransactionRequest"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { FundProceedsRecipientTransactionAppServiceRequest } from "@app/transaction/fundproceedsrecipienttransaction/service/model/FundProceedsRecipientTransactionAppServiceRequest"
import { FundProceedsRecipientTransactionPort } from "@port/transaction/usecase/fundproceedsrecipienttransaction/FundProceedsRecipientTransactionPort"

@RestController("treasuries")
export class FundProceedsRecipientTransactionHttpAdapter implements FundProceedsRecipientTransactionPort {
  constructor(
    private readonly fundProceedsRecipientTransactionAppService: FundProceedsRecipientTransactionAppService,
  ) {}

  @Post(":treasuryContractId/proceeds-recipients/:recipientContractId/transfer")
  fundProceedsRecipient(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("recipientContractId") recipientContractId: string,
    @Body() request: FundProceedsRecipientTransactionRequest,
  ): TransactionResponse {
    return this.fundProceedsRecipientTransactionAppService.execute(
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
