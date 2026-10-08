// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  RevokeRoleTransactionAppService,
  RevokeRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { RevokeRoleTransactionPort } from "./RevokeRoleTransactionPort"
import { RevokeRoleTransactionRequest } from "./model/RevokeRoleTransactionRequest"

@ApiTags("ATS")
@RestController("factories")
export class RevokeRoleTransactionHttpAdapter implements RevokeRoleTransactionPort {
  constructor(private readonly revokeRoleTransactionAppService: RevokeRoleTransactionAppService) {}

  @ApiOperation({ summary: "Revoke role from user in factory" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":factoryContractId/roles/:roleId/users/:userAccountId")
  async revokeRole(
    @Param("factoryContractId") factoryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: RevokeRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.revokeRoleTransactionAppService.execute(
      new RevokeRoleTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        factoryContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
