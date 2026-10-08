// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  GrantRoleTransactionAppService,
  GrantRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionPort } from "./GrantRoleTransactionPort"
import { GrantRoleTransactionRequest } from "./model/GrantRoleTransactionRequest"

@ApiTags("ATS")
@RestController("factories")
export class GrantRoleTransactionHttpAdapter implements GrantRoleTransactionPort {
  constructor(private readonly grantRoleTransactionAppService: GrantRoleTransactionAppService) {}

  @ApiOperation({ summary: "Grant role to user in factory" })
  @ApiResponse({ status: 201, type: TransactionResponse })
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
