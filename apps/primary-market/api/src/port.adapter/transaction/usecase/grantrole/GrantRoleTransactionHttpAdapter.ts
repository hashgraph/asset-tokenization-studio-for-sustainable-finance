// SPDX-License-Identifier: Apache-2.0
import {
  GrantRoleTransactionAppService,
  GrantRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "./model/GrantRoleTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
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
