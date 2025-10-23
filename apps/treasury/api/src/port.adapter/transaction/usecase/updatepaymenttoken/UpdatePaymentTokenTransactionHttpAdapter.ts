// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Put } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { UpdatePaymentTokenTransactionRequest } from "./model/UpdatePaymentTokenTransactionRequest"
import { UpdatePaymentTokenTransactionAppService } from "@app/transaction/updatepaymenttoken/service/UpdatePaymentTokenTransactionAppService"
import { UpdatePaymentTokenTransactionAppServiceRequest } from "@app/transaction/updatepaymenttoken/service/model/UpdatePaymentTokenTransactionAppServiceRequest"
import { UpdatePaymentTokenTransactionPort } from "@port/transaction/usecase/updatepaymenttoken/UpdatePaymentTokenTransactionPort"

@RestController("treasuries")
export class UpdatePaymentTokenTransactionHttpAdapter implements UpdatePaymentTokenTransactionPort {
  constructor(private readonly updatePaymentTokenTransactionAppService: UpdatePaymentTokenTransactionAppService) {}

  @Put(":treasuryContractId/payment-tokens")
  async updatePaymentToken(
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: UpdatePaymentTokenTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.updatePaymentTokenTransactionAppService.execute(
      new UpdatePaymentTokenTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        request.paymentTokenContractId,
      ),
    )
  }
}
