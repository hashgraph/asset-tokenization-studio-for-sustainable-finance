// SPDX-License-Identifier: Apache-2.0

import { Body, Delete, Param } from "@nestjs/common"
import {
  RevokeRoleTransactionAppService,
  RevokeRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { RevokePrimaryMarketFactoryRoleTransactionPort } from "./RevokePrimaryMarketFactoryRoleTransactionPort"
import { RevokePrimaryMarketFactoryRoleTransactionRequest } from "./model/RevokePrimaryMarketFactoryRoleTransactionRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class RevokePrimaryMarketFactoryRoleTransactionHttpAdapter
  implements RevokePrimaryMarketFactoryRoleTransactionPort
{
  constructor(private readonly revokeRoleTransactionAppService: RevokeRoleTransactionAppService) {}

  @ApiOperation({ summary: "Revokes role from user for a factory" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete("factories/:factoryContractId/roles/:roleId/users/:userAccountId")
  async revokePrimaryMarketFactoryRole(
    @Param("factoryContractId") factoryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: RevokePrimaryMarketFactoryRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.revokeRoleTransactionAppService.execute(
      new RevokeRoleTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        factoryContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
