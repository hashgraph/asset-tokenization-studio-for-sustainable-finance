// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingRedeemTransactionRequest } from "./model/CreateClearingRedeemTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CreateClearingRedeemTransactionPort } from "./CreateClearingRedeemTransactionPort"
import { CreateClearingRedeemTransactionAppServiceRequest } from "@app/bond/transaction/createclearingredeemtransaction/service/model/CreateClearingRedeemTransactionAppServiceRequest"
import { CreateClearingRedeemTransactionAppService } from "@app/bond/transaction/createclearingredeemtransaction/service/CreateClearingRedeemTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class CreateClearingRedeemTransactionHttpAdapter implements CreateClearingRedeemTransactionPort {
  constructor(private readonly createClearingRedeemTransactionAppService: CreateClearingRedeemTransactionAppService) {}

  @ApiOperation({ summary: "Create a clearing redeem transaction" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/holders/:holderAccountId/clearings/redeem")
  async createClearingRedeemTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: CreateClearingRedeemTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CreateClearingRedeemTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      request.amount,
      Math.floor(request.expirationTimestamp.getTime() / 1000).toString(),
      request.data,
    )

    return await this.createClearingRedeemTransactionAppService.execute(appServiceRequest)
  }
}
