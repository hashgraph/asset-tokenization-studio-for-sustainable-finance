// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingTransferTransactionRequest } from "./model/CreateClearingTransferTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { CreateClearingTransferTransactionPort } from "./CreateClearingTransferTransactionPort"
import { CreateClearingTransferTransactionAppServiceRequest } from "@app/bond/transaction/createclearingtransfertransaction/service/model/CreateClearingTransferTransactionAppServiceRequest"
import { CreateClearingTransferTransactionAppService } from "@app/bond/transaction/createclearingtransfertransaction/service/CreateClearingTransferTransactionAppService"

@RestController("bonds")
export class CreateClearingTransferTransactionHttpAdapter implements CreateClearingTransferTransactionPort {
  constructor(
    private readonly createClearingTransferTransactionAppService: CreateClearingTransferTransactionAppService,
  ) {}

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
      request.expirationTimestamp.getTime(),
      request.toAccountId,
      request.data,
    )

    return await this.createClearingTransferTransactionAppService.execute(appServiceRequest)
  }
}
