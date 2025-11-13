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

@RestController("treasuries")
export class ApplyRolesTransactionHttpAdapter implements ApplyRolesTransactionPort {
  constructor(private readonly applyRolesTransactionAppService: ApplyRolesTransactionAppService) {}

  @Post(":treasuryContractId/users/:userAccountId/roles")
  async applyRoles(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("userAccountId") userAccountId: string,
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
