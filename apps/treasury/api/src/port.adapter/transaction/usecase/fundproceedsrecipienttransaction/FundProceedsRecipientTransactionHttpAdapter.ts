// SPDX-License-Identifier: Apache-2.0

import { Body, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { FundProceedsRecipientTransactionRequest } from "./model/FundProceedsRecipientTransactionRequest"
import { FundProceedsRecipientTransactionAppService } from "../../../../app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { FundProceedsRecipientTransactionAppServiceRequest } from "../../../../app/transaction/fundproceedsrecipienttransaction/service/model/FundProceedsRecipientTransactionAppServiceRequest"

@RestController("proceeds-recipients")
export class FundProceedsRecipientTransactionHttpAdapter {
  constructor(
    private readonly fundProceedsRecipientTransactionAppService: FundProceedsRecipientTransactionAppService,
  ) {}

  @Post("fund")
  fundProceedsRecipient(@Body() request: FundProceedsRecipientTransactionRequest): TransactionResponse {
    return this.fundProceedsRecipientTransactionAppService.execute(
      request as FundProceedsRecipientTransactionAppServiceRequest,
    )
  }
}
