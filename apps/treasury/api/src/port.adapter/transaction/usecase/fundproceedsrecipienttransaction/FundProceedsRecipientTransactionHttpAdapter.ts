// SPDX-License-Identifier: Apache-2.0

import { BadRequestException, Body, Param, Post } from "@nestjs/common"
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
    this.validateHexadecimal(treasuryId, "treasuryId")
    this.validateHexadecimal(recipientId, "recipientId")

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

  private validateHexadecimal(value: string, paramName: string): void {
    const hexPattern = /^0x[a-fA-F0-9]+$/
    if (!hexPattern.test(value)) {
      throw new BadRequestException(`${paramName} must be a valid hexadecimal string`)
    }
  }
}
