// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  GrantRoleTransactionAppService,
  GrantRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionPort } from "./GrantRoleTransactionPort"
import { GrantRoleTransactionRequest } from "./model/GrantRoleTransactionRequest"

@RestController("factories")
export class GrantRoleTransactionHttpAdapter implements GrantRoleTransactionPort {
  constructor(private readonly grantRoleTransactionAppService: GrantRoleTransactionAppService) {}

  @Post(":factoryContractId/roles/:roleId/users/:userAccountId")
  async grantRole(
    @Param("factoryContractId") factoryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.grantRoleTransactionAppService.execute(
      new GrantRoleTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        factoryContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
