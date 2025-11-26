// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  GrantRoleTransactionAppService,
  GrantRoleTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { GrantPrimaryMarketFactoryRoleTransactionPort } from "./GrantPrimaryMarketFactoryRoleTransactionPort"
import { GrantPrimaryMarketFactoryRoleTransactionRequest } from "./model/GrantPrimaryMarketFactoryRoleTransactionRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GrantPrimaryMarketFactoryRoleTransactionHttpAdapter
  implements GrantPrimaryMarketFactoryRoleTransactionPort
{
  constructor(private readonly grantRoleTransactionAppService: GrantRoleTransactionAppService) {}

  @ApiOperation({ summary: "Grants role to user for a factory" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post("factories/:factoryContractId/roles/:roleId/users/:userAccountId")
  async grantPrimaryMarketFactoryRole(
    @Param("factoryContractId") factoryContractId: string,
    @Param("roleId") roleId: string,
    @Param("userAccountId") userAccountId: string,
    @Body() request: GrantPrimaryMarketFactoryRoleTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.grantRoleTransactionAppService.execute(
      new GrantRoleTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        factoryContractId,
        roleId,
        userAccountId,
      ),
    )
  }
}
