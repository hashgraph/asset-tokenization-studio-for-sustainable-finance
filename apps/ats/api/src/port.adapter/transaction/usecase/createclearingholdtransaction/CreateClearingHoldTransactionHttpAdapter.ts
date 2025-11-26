// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingHoldTransactionRequest } from "./model/CreateClearingHoldTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { CreateClearingHoldTransactionPort } from "./CreateClearingHoldTransactionPort"
import { CreateClearingHoldTransactionAppServiceRequest } from "@app/bond/transaction/createclearingholdtransaction/service/model/CreateClearingHoldTransactionAppServiceRequest"
import { CreateClearingHoldTransactionAppService } from "@app/bond/transaction/createclearingholdtransaction/service/CreateClearingHoldTransactionAppService"

@RestController("bonds")
export class CreateClearingHoldTransactionHttpAdapter implements CreateClearingHoldTransactionPort {
  constructor(private readonly createClearingHoldTransactionAppService: CreateClearingHoldTransactionAppService) {}

  @Post(":bondContractId/holders/:holderAccountId/clearings/hold")
  async createClearingTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: CreateClearingHoldTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CreateClearingHoldTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      request.amount,
      Math.floor(request.expirationTimestamp.getTime() / 1000).toString(),
      request.escrowAddress,
      request.data,
    )

    return await this.createClearingHoldTransactionAppService.execute(appServiceRequest)
  }
}
