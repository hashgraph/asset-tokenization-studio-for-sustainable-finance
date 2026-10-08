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

@ApiTags("Treasury")
@RestController("treasuries")
export class ApplyRolesTransactionHttpAdapter implements ApplyRolesTransactionPort {
  constructor(private readonly applyRolesTransactionAppService: ApplyRolesTransactionAppService) {}

  @ApiOperation({ summary: "Batch grant role to user" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/users/:userId/roles")
  async applyRoles(
    @Param("treasuryId") treasuryContractId: string,
    @Param("userId") userAccountId: string,
    @Body() request: ApplyRolesTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.applyRolesTransactionAppService.execute(
      new ApplyRolesTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        request.rolesToGrant || [],
        request.rolesToRevoke || [],
        userAccountId,
      ),
    )
  }
}
