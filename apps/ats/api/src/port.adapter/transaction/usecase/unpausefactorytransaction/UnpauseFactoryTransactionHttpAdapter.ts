// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  UnpauseTransactionAppService,
  UnpauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { UnpauseFactoryTransactionPort } from "./UnpauseFactoryTransactionPort"
import { UnpauseFactoryTransactionRequest } from "./model/UnpauseFactoryTransactionRequest"

@RestController("factories")
export class UnpauseFactoryTransactionHttpAdapter implements UnpauseFactoryTransactionPort {
  constructor(private readonly unpauseTransactionAppService: UnpauseTransactionAppService) {}

  @Post(":factoryId/unpause")
  async unpauseFactory(
    @Param("factoryId") factoryId: string,
    @Body() request: UnpauseFactoryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTransactionAppService.execute(
      new UnpauseTransactionAppServiceRequest(request.format, request.accountId!, factoryId),
    )
  }
}
