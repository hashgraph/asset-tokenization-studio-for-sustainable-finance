// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  UnpauseTransactionAppService,
  UnpauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { UnpauseFactoryTransactionPort } from "./UnpauseFactoryTransactionPort"
import { UnpauseFactoryTransactionRequest } from "./model/UnpauseFactoryTransactionRequest"

@ApiTags("ATS")
@RestController("factories")
export class UnpauseFactoryTransactionHttpAdapter implements UnpauseFactoryTransactionPort {
  constructor(private readonly unpauseTransactionAppService: UnpauseTransactionAppService) {}

  @ApiOperation({ summary: "Unpause a factory" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":factoryContractId/unpause")
  async unpauseFactory(
    @Param("factoryContractId") factoryContractId: string,
    @Body() request: UnpauseFactoryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTransactionAppService.execute(
      new UnpauseTransactionAppServiceRequest(request.format, request.accountId!, factoryContractId),
    )
  }
}
