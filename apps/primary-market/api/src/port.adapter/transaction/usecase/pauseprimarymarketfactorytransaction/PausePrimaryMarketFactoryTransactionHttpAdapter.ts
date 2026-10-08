// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  PauseTransactionAppService,
  PauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { PausePrimaryMarketFactoryTransactionPort } from "./PausePrimaryMarketFactoryTransactionPort"
import { PausePrimaryMarketFactoryTransactionRequest } from "./model/PausePrimaryMarketFactoryTransactionRequest"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class PausePrimaryMarketFactoryTransactionHttpAdapter implements PausePrimaryMarketFactoryTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @ApiOperation({ summary: "Pauses the primary market factory" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post("factories/:factoryContractId/pause")
  async pauseFactory(
    @Param("factoryContractId") factoryContractId: string,
    @Body() request: PausePrimaryMarketFactoryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, factoryContractId),
    )
  }
}
