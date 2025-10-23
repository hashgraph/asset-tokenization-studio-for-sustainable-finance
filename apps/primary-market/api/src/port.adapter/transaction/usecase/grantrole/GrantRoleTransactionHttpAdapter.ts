// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "./model/GrantRoleTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { GrantRoleTransactionAppServiceRequest } from "@app/transaction/grantrole/service/model/GrantRoleTransactionAppServiceRequest"
import { GrantRoleTransactionAppService } from "@app/transaction/grantrole/service/GrantRoleTransactionAppService"
import { GrantRoleTransactionPort } from "./GrantRoleTransactionPort"

@RestController("primary-markets")
export class GrantRoleTransactionHttpAdapter implements GrantRoleTransactionPort {
  constructor(private readonly grantRoleTransactionAppService: GrantRoleTransactionAppService) {}

  @Post(":marketContractId/roles/:roleId/users/:userAccountId")
  async grantRoleTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new GrantRoleTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      roleId,
      userAccountId,
    )
    return await this.grantRoleTransactionAppService.execute(appServiceRequest)
  }
}
