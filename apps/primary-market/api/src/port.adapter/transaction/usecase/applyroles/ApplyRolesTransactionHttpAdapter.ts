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

@RestController("primary-markets")
export class ApplyRolesTransactionHttpAdapter implements ApplyRolesTransactionPort {
  constructor(private readonly applyRolesTransactionAppService: ApplyRolesTransactionAppService) {}

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
