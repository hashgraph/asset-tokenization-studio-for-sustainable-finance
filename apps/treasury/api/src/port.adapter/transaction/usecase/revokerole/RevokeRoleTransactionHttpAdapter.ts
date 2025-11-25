// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import {
  RestController,
  RevokeRoleTransactionAppService,
  RevokeRoleTransactionAppServiceRequest,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "@port/transaction/usecase/grantrole/model/GrantRoleTransactionRequest"
import { RevokeRoleTransactionPort } from "@port/transaction/usecase/revokerole/RevokeRoleTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class RevokeRoleTransactionHttpAdapter implements RevokeRoleTransactionPort {
  constructor(private readonly revokeRoleTransactionAppService: RevokeRoleTransactionAppService) {}

  @ApiOperation({ summary: "Revokes rol from user" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":treasuryId/roles/:roleId/users/:userId")
  async revokeRole(
    @Param("treasuryId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userId") userAccountId: string,
    @Body() request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.revokeRoleTransactionAppService.execute(
      new RevokeRoleTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
