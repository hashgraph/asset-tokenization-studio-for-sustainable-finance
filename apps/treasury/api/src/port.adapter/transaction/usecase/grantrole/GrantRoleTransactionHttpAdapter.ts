// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  GrantRoleTransactionAppService,
  GrantRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionPort } from "@port/transaction/usecase/grantrole/GrantRoleTransactionPort"
import { GrantRoleTransactionRequest } from "@port/transaction/usecase/grantrole/model/GrantRoleTransactionRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GrantRoleTransactionHttpAdapter implements GrantRoleTransactionPort {
  constructor(private readonly grantRoleTransactionAppService: GrantRoleTransactionAppService) {}

  @ApiOperation({ summary: "Grants role to user" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/roles/:roleId/users/:userId")
  async grantRole(
    @Param("treasuryId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userId") userAccountId: string,
    @Body() request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.grantRoleTransactionAppService.execute(
      new GrantRoleTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
