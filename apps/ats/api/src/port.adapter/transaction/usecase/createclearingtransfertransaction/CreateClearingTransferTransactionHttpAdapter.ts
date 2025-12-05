// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingTransferTransactionRequest } from "./model/CreateClearingTransferTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CreateClearingTransferTransactionPort } from "./CreateClearingTransferTransactionPort"
import { CreateClearingTransferTransactionAppServiceRequest } from "@app/transaction/clearing/createclearingtransfertransaction/service/model/CreateClearingTransferTransactionAppServiceRequest"
import { CreateClearingTransferTransactionAppService } from "@app/transaction/clearing/createclearingtransfertransaction/service/CreateClearingTransferTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class CreateClearingTransferTransactionHttpAdapter implements CreateClearingTransferTransactionPort {
  constructor(
    private readonly createClearingTransferTransactionAppService: CreateClearingTransferTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Create a clearing transfer transaction" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/holders/:holderAccountId/clearings/transfer")
  async createClearingTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: CreateClearingTransferTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CreateClearingTransferTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      request.amount,
      Math.floor(request.expirationTimestamp.getTime() / 1000).toString(),
      request.toAccountId,
      request.data,
    )

    return await this.createClearingTransferTransactionAppService.execute(appServiceRequest)
  }
}
