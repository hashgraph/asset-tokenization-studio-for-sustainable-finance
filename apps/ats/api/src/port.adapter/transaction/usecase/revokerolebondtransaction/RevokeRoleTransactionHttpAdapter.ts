// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import {
  RestController,
  RevokeRoleTransactionAppService,
  RevokeRoleTransactionAppServiceRequest,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "@port/transaction/usecase/grantrolebondtransaction/model/GrantRoleTransactionRequest"
import { RevokeRoleTransactionPort } from "@port/transaction/usecase/revokerolebondtransaction/RevokeRoleTransactionPort"

@RestController("bonds")
export class RevokeRoleTransactionHttpAdapter implements RevokeRoleTransactionPort {
  constructor(private readonly revokeRoleTransactionAppService: RevokeRoleTransactionAppService) {}

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
