// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { TransferPaymentTokenTransactionRequest } from "./model/TransferPaymentTokenTransactionRequest"
import { TransferPaymentTokenTransactionAppService } from "@app/transaction/transferpaymenttoken/service/TransferPaymentTokenTransactionAppService"
import { TransferPaymentTokenTransactionAppServiceRequest } from "@app/transaction/transferpaymenttoken/service/model/TransferPaymentTokenTransactionAppServiceRequest"
import { TransferPaymentTokenTransactionPort } from "@port/transaction/usecase/transferpaymenttoken/TransferPaymentTokenTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class TransferPaymentTokenTransactionHttpAdapter implements TransferPaymentTokenTransactionPort {
  constructor(private readonly transferPaymentTokenTransactionAppService: TransferPaymentTokenTransactionAppService) {}

  @ApiOperation({ summary: "Transfers payment tokens from treasury to a destination" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/payment-tokens/transfer")
  async transferPaymentToken(
    @Param("treasuryId") treasuryContractId: string,
    @Body() request: TransferPaymentTokenTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.transferPaymentTokenTransactionAppService.execute(
      new TransferPaymentTokenTransactionAppServiceRequest(
        request.toAccountId,
        request.amount,
        request.format,
        request.accountId || "",
        treasuryContractId,
      ),
    )
  }
}
