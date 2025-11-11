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

@RestController("treasuries")
export class RevokeRoleTransactionHttpAdapter implements RevokeRoleTransactionPort {
  constructor(private readonly revokeRoleTransactionAppService: RevokeRoleTransactionAppService) {}

  @Delete(":treasuryContractId/roles/:roleId/users/:userAccountId")
  async revokeRole(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
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
