// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import {
  RenounceRoleTransactionAppService,
  RenounceRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { RenounceRoleTransactionPort } from "@port/transaction/usecase/renouncerole/RenounceRoleTransactionPort"
import { RenounceRoleTransactionRequest } from "@port/transaction/usecase/renouncerole/model/RenounceRoleTransactionRequest"

@RestController("treasuries")
export class RenounceRoleTransactionHttpAdapter implements RenounceRoleTransactionPort {
  constructor(private readonly renounceRoleTransactionAppService: RenounceRoleTransactionAppService) {}

  @Delete(":treasuryContractId/roles/:roleId")
  async renounceRole(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Body() request: RenounceRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.renounceRoleTransactionAppService.execute(
      new RenounceRoleTransactionAppServiceRequest(request.format, request.accountId!, treasuryContractId, roleId),
    )
  }
}
