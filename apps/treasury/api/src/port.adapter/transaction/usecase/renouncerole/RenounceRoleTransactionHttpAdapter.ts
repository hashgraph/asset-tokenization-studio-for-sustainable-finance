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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class RenounceRoleTransactionHttpAdapter implements RenounceRoleTransactionPort {
  constructor(private readonly renounceRoleTransactionAppService: RenounceRoleTransactionAppService) {}

  @ApiOperation({ summary: "Renounces rol from user" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":treasuryId/roles/:roleId")
  async renounceRole(
    @Param("treasuryId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Body() request: RenounceRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.renounceRoleTransactionAppService.execute(
      new RenounceRoleTransactionAppServiceRequest(request.format, request.accountId!, treasuryContractId, roleId),
    )
  }
}
