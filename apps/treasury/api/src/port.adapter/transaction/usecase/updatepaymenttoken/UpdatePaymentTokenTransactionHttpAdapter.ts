// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Put } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { UpdatePaymentTokenTransactionRequest } from "./model/UpdatePaymentTokenTransactionRequest"
import { UpdatePaymentTokenTransactionAppService } from "@app/transaction/updatepaymenttoken/service/UpdatePaymentTokenTransactionAppService"
import { UpdatePaymentTokenTransactionAppServiceRequest } from "@app/transaction/updatepaymenttoken/service/model/UpdatePaymentTokenTransactionAppServiceRequest"
import { UpdatePaymentTokenTransactionPort } from "@port/transaction/usecase/updatepaymenttoken/UpdatePaymentTokenTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class UpdatePaymentTokenTransactionHttpAdapter implements UpdatePaymentTokenTransactionPort {
  constructor(private readonly updatePaymentTokenTransactionAppService: UpdatePaymentTokenTransactionAppService) {}

  @ApiOperation({ summary: "Updates treasury's payment token" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Put(":treasuryId/payment-tokens")
  async updatePaymentToken(
    @Param("treasuryId") treasuryContractId: string,
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
