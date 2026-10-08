// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  ApplyRolesTransactionAppService,
  ApplyRolesTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { ApplyRolesTransactionPort } from "@port/transaction/usecase/applyroles/ApplyRolesTransactionPort"
import { ApplyRolesTransactionRequest } from "@port/transaction/usecase/applyroles/model/ApplyRolesTransactionRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class ApplyRolesTransactionHttpAdapter implements ApplyRolesTransactionPort {
  constructor(private readonly applyRolesTransactionAppService: ApplyRolesTransactionAppService) {}

  @ApiOperation({ summary: "Applies multiple roles to a user (grant and/or revoke)" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":marketContractId/users/:userAccountId/roles")
  async applyRoles(
    @Param("marketContractId") marketContractId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: ApplyRolesTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.applyRolesTransactionAppService.execute(
      new ApplyRolesTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        marketContractId,
        request.rolesToGrant || [],
        request.rolesToRevoke || [],
        userAccountId,
      ),
    )
  }
}
