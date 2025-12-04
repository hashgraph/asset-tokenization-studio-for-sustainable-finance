// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondHoldTransactionRequest } from "./model/CreateBondHoldTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CreateBondHoldTransactionPort } from "./CreateBondHoldTransactionPort"
import { CreateBondHoldTransactionAppServiceRequest } from "@app/transaction/hold/createbondholdtransaction/service/model/CreateBondHoldTransactionAppServiceRequest"
import { CreateBondHoldTransactionAppService } from "@app/transaction/hold/createbondholdtransaction/service/CreateBondHoldTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class CreateBondHoldTransactionHttpAdapter implements CreateBondHoldTransactionPort {
  constructor(private readonly createBondHoldTransactionAppService: CreateBondHoldTransactionAppService) {}

  @ApiOperation({ summary: "Create a bond hold" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/holders/:holderAccountId/holds")
  async createBondHoldTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: CreateBondHoldTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CreateBondHoldTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      request.partition,
      request.amount,
      new Date(request.expirationTimestamp),
      request.escrowAccountId,
      holderAccountId,
      request.data,
    )

    return await this.createBondHoldTransactionAppService.execute(appServiceRequest)
  }
}
