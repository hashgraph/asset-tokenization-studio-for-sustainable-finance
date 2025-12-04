// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  PauseTransactionAppService,
  PauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { PauseFactoryTransactionPort } from "./PauseFactoryTransactionPort"
import { PauseFactoryTransactionRequest } from "./model/PauseFactoryTransactionRequest"

@ApiTags("ATS")
@RestController("factories")
export class PauseFactoryTransactionHttpAdapter implements PauseFactoryTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @ApiOperation({ summary: "Pause a factory" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":factoryContractId/pause")
  async pauseFactory(
    @Param("factoryContractId") factoryContractId: string,
    @Body() request: PauseFactoryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, factoryContractId),
    )
  }
}
