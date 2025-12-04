// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  RestController,
  TransactionResponse,
  UnpauseTransactionAppService,
  UnpauseTransactionAppServiceRequest,
} from "@hashgraph/green-bonds-shared-core"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { UnpausePrimaryMarketFactoryTransactionPort } from "./UnpausePrimaryMarketFactoryTransactionPort"
import { UnpausePrimaryMarketFactoryTransactionRequest } from "./model/UnpausePrimaryMarketFactoryTransactionRequest"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class UnpausePrimaryMarketFactoryTransactionHttpAdapter implements UnpausePrimaryMarketFactoryTransactionPort {
  constructor(private readonly unpauseTransactionAppService: UnpauseTransactionAppService) {}

  @ApiOperation({ summary: "Unpauses the primary market factory" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post("factories/:factoryContractId/unpause")
  async unpauseFactory(
    @Param("factoryContractId") factoryContractId: string,
    @Body() request: UnpausePrimaryMarketFactoryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTransactionAppService.execute(
      new UnpauseTransactionAppServiceRequest(request.format, request.accountId!, factoryContractId),
    )
  }
}
