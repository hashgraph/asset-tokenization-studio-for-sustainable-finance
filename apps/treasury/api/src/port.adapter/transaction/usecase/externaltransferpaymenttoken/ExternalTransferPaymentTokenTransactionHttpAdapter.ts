// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExternalTransferPaymentTokenTransactionAppService } from "@app/transaction/externaltransferpaymenttoken/service/ExternalTransferPaymentTokenTransactionAppService"
import { ExternalTransferPaymentTokenTransactionAppServiceRequest } from "@app/transaction/externaltransferpaymenttoken/service/model/ExternalTransferPaymentTokenTransactionAppServiceRequest"
import { ExternalTransferPaymentTokenTransactionRequest } from "@port/transaction/usecase/externaltransferpaymenttoken/model/ExternalTransferPaymentTokenTransactionRequest"
import { ExternalTransferPaymentTokenTransactionPort } from "@port/transaction/usecase/externaltransferpaymenttoken/ExternalTransferPaymentTokenTransactionPort"

@RestController("payment-tokens")
export class ExternalTransferPaymentTokenTransactionHttpAdapter implements ExternalTransferPaymentTokenTransactionPort {
  constructor(private readonly appService: ExternalTransferPaymentTokenTransactionAppService) {}

  @Post(":paymentTokenContractId/treasuries/:treasuryContractId/transfer")
  async externalTransferPaymentToken(
    @Param("paymentTokenContractId") paymentTokenContractId: string,
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: ExternalTransferPaymentTokenTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.appService.execute(
      new ExternalTransferPaymentTokenTransactionAppServiceRequest(
        request.format,
        request.accountId,
        paymentTokenContractId,
        treasuryContractId,
        request.amount,
      ),
    )
  }
}
