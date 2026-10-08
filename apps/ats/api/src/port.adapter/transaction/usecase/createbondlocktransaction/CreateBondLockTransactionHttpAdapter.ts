// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondLockTransactionRequest } from "./model/CreateBondLockTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CreateBondLockTransactionPort } from "./CreateBondLockTransactionPort"
import { CreateBondLockTransactionAppServiceRequest } from "@app/transaction/lock/createbondlocktransaction/service/model/CreateBondLockTransactionAppServiceRequest"
import { CreateBondLockTransactionAppService } from "@app/transaction/lock/createbondlocktransaction/service/CreateBondLockTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class CreateBondLockTransactionHttpAdapter implements CreateBondLockTransactionPort {
  constructor(private readonly createBondLockTransactionAppService: CreateBondLockTransactionAppService) {}

  @ApiOperation({ summary: "Create a bond lock" })
  @ApiResponse({ status: 201, type: TransactionResponse })
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
      Math.floor(request.expirationTimestamp.getTime() / 1000).toString(),
    )

    return await this.createBondLockTransactionAppService.execute(appServiceRequest)
  }
}
