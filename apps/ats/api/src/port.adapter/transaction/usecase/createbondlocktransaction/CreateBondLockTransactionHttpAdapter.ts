// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondLockTransactionRequest } from "./model/CreateBondLockTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { CreateBondLockTransactionPort } from "./CreateBondLockTransactionPort"
import { CreateBondLockTransactionAppServiceRequest } from "@app/bond/transaction/createbondlocktransaction/service/model/CreateBondLockTransactionAppServiceRequest"
import { CreateBondLockTransactionAppService } from "@app/bond/transaction/createbondlocktransaction/service/CreateBondLockTransactionAppService"

@RestController("bonds")
export class CreateBondLockTransactionHttpAdapter implements CreateBondLockTransactionPort {
  constructor(private readonly createBondLockTransactionAppService: CreateBondLockTransactionAppService) {}

  @Post(":bondContractId/holders/:holderAccountId/locks")
  async createBondLockTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: CreateBondLockTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CreateBondLockTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      request.amount,
      request.expirationTimestamp.getTime().toString(),
    )

    return await this.createBondLockTransactionAppService.execute(appServiceRequest)
  }
}
