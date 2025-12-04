// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  GrantRoleTransactionAppService,
  GrantRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionPort } from "@port/transaction/usecase/grantrolebondtransaction/GrantRoleTransactionPort"
import { GrantRoleTransactionRequest } from "@port/transaction/usecase/grantrolebondtransaction/model/GrantRoleTransactionRequest"

@ApiTags("ATS")
@RestController("bonds")
export class GrantRoleTransactionHttpAdapter implements GrantRoleTransactionPort {
  constructor(private readonly grantRoleTransactionAppService: GrantRoleTransactionAppService) {}

  @ApiOperation({ summary: "Grant role to user in bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/roles/:roleId/users/:userAccountId")
  async grantRole(
    @Param("bondContractId") bondContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.grantRoleTransactionAppService.execute(
      new GrantRoleTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        bondContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
