// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DissociatePaymentTokenTransactionRequest } from "./model/DissociatePaymentTokenTransactionRequest"
import { DissociatePaymentTokenTransactionPort } from "./DissociatePaymentTokenTransactionPort"
import { DissociatePaymentTokenTransactionAppService } from "@app/transaction/dissociatepaymenttoken/DissociatePaymentTokenTransactionAppService"
import { DissociatePaymentTokenTransactionAppServiceRequest } from "@app/transaction/dissociatepaymenttoken/model/DissociatePaymentTokenTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class DissociatePaymentTokenTransactionHttpAdapter implements DissociatePaymentTokenTransactionPort {
  constructor(
    private readonly dissociatePaymentTokenTransactionAppService: DissociatePaymentTokenTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Dissociates a certain payment token from the treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/payment-tokens/:tokenId/dissociate")
  async dissociatePaymentToken(
    @Param("treasuryId") treasuryContractId: string,
    @Param("tokenId") paymentTokenContractId: string,
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
