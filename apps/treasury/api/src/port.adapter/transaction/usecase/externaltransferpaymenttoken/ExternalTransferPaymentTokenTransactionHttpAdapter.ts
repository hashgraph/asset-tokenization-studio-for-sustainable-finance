// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExternalTransferPaymentTokenTransactionAppService } from "@app/transaction/externaltransferpaymenttoken/service/ExternalTransferPaymentTokenTransactionAppService"
import { ExternalTransferPaymentTokenTransactionAppServiceRequest } from "@app/transaction/externaltransferpaymenttoken/service/model/ExternalTransferPaymentTokenTransactionAppServiceRequest"
import { ExternalTransferPaymentTokenTransactionRequest } from "@port/transaction/usecase/externaltransferpaymenttoken/model/ExternalTransferPaymentTokenTransactionRequest"
import { ExternalTransferPaymentTokenTransactionPort } from "@port/transaction/usecase/externaltransferpaymenttoken/ExternalTransferPaymentTokenTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("payment-tokens")
export class ExternalTransferPaymentTokenTransactionHttpAdapter implements ExternalTransferPaymentTokenTransactionPort {
  constructor(private readonly appService: ExternalTransferPaymentTokenTransactionAppService) {}

  @ApiOperation({ summary: "Payment token transfers to the treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":tokenId/treasuries/:treasuryId/transfer")
  async externalTransferPaymentToken(
    @Param("tokenId") paymentTokenContractId: string,
    @Param("treasuryId") treasuryContractId: string,
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
