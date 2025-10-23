// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { TransferPaymentTokenTransactionRequest } from "./model/TransferPaymentTokenTransactionRequest"
import { TransferPaymentTokenTransactionAppService } from "@app/transaction/transferpaymenttoken/service/TransferPaymentTokenTransactionAppService"
import { TransferPaymentTokenTransactionAppServiceRequest } from "@app/transaction/transferpaymenttoken/service/model/TransferPaymentTokenTransactionAppServiceRequest"
import { TransferPaymentTokenTransactionPort } from "@port/transaction/usecase/transferpaymenttoken/TransferPaymentTokenTransactionPort"

@RestController("treasuries")
export class TransferPaymentTokenTransactionHttpAdapter implements TransferPaymentTokenTransactionPort {
  constructor(private readonly transferPaymentTokenTransactionAppService: TransferPaymentTokenTransactionAppService) {}

  @Post(":treasuryContractId/payment-tokens/transfer")
  async transferPaymentToken(
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: TransferPaymentTokenTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.transferPaymentTokenTransactionAppService.execute(
      new TransferPaymentTokenTransactionAppServiceRequest(
        request.to,
        request.amount,
        request.format,
        request.accountId || "",
        treasuryContractId,
      ),
    )
  }
}
