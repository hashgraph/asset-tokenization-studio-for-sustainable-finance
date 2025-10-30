// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DissociatePaymentTokenTransactionRequest } from "./model/DissociatePaymentTokenTransactionRequest"
import { DissociatePaymentTokenTransactionPort } from "./DissociatePaymentTokenTransactionPort"
import { DissociatePaymentTokenTransactionAppService } from "@app/transaction/dissociatepaymenttoken/DissociatePaymentTokenTransactionAppService"
import { DissociatePaymentTokenTransactionAppServiceRequest } from "@app/transaction/dissociatepaymenttoken/model/DissociatePaymentTokenTransactionAppServiceRequest"

@RestController("treasuries")
export class DissociatePaymentTokenTransactionHttpAdapter implements DissociatePaymentTokenTransactionPort {
  constructor(
    private readonly dissociatePaymentTokenTransactionAppService: DissociatePaymentTokenTransactionAppService,
  ) {}

  @Post(":treasuryContractId/payment-tokens/:paymentTokenContractId/dissociate")
  async dissociatePaymentToken(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("paymentTokenContractId") paymentTokenContractId: string,
    @Body() request: DissociatePaymentTokenTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.dissociatePaymentTokenTransactionAppService.execute(
      new DissociatePaymentTokenTransactionAppServiceRequest(
        paymentTokenContractId,
        request.format,
        request.accountId || "",
        treasuryContractId,
      ),
    )
  }
}
