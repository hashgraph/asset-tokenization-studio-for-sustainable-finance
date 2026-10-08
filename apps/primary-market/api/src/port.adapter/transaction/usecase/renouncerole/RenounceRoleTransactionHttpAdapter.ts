// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import {
  RenounceRoleTransactionAppService,
  RenounceRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { RenounceRoleTransactionPort } from "./RenounceRoleTransactionPort"
import { RenounceRoleTransactionRequest } from "./model/RenounceRoleTransactionRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class RenounceRoleTransactionHttpAdapter implements RenounceRoleTransactionPort {
  constructor(private readonly renounceRoleTransactionAppService: RenounceRoleTransactionAppService) {}

  @ApiOperation({ summary: "Renounces a role" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":marketContractId/roles/:roleId")
  async renounceRole(
    @Param("marketContractId") marketContractId: string,
    @Param("roleId") roleId: string,
    @Body() request: RenounceRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.renounceRoleTransactionAppService.execute(
      new RenounceRoleTransactionAppServiceRequest(request.format, request.accountId!, marketContractId, roleId),
    )
  }
}
