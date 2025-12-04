// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  RestController,
  RevokeRoleTransactionAppService,
  RevokeRoleTransactionAppServiceRequest,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "@port/transaction/usecase/grantrolebondtransaction/model/GrantRoleTransactionRequest"
import { RevokeRoleTransactionPort } from "@port/transaction/usecase/revokerolebondtransaction/RevokeRoleTransactionPort"

@ApiTags("ATS")
@RestController("bonds")
export class RevokeRoleTransactionHttpAdapter implements RevokeRoleTransactionPort {
  constructor(private readonly revokeRoleTransactionAppService: RevokeRoleTransactionAppService) {}

  @ApiOperation({ summary: "Revoke role from user in bond" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/roles/:roleId/users/:userAccountId")
  async revokeRole(
    @Param("bondContractId") bondContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.revokeRoleTransactionAppService.execute(
      new RevokeRoleTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        bondContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
