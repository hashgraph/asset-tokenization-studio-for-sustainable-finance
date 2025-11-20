// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  PauseTransactionAppService,
  PauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { PauseFactoryTransactionPort } from "./PauseFactoryTransactionPort"
import { PauseFactoryTransactionRequest } from "./model/PauseFactoryTransactionRequest"

@RestController("factories")
export class PauseFactoryTransactionHttpAdapter implements PauseFactoryTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @Post(":factoryId/pause")
  async pauseFactory(
    @Param("factoryId") factoryId: string,
    @Body() request: PauseFactoryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, factoryId),
    )
  }
}
