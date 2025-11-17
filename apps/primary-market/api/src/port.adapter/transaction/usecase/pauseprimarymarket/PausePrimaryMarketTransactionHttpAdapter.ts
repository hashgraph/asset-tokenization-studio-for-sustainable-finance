// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  PauseTransactionAppService,
  PauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { PausePrimaryMarketTransactionPort } from "@port/transaction/usecase/pauseprimarymarket/PausePrimaryMarketTransactionPort"
import { PausePrimaryMarketTransactionRequest } from "@port/transaction/usecase/pauseprimarymarket/model/PausePrimaryMarketTransactionRequest"

@RestController("primary-markets")
export class PausePrimaryMarketTransactionHttpAdapter implements PausePrimaryMarketTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @Post(":marketContractId/pause")
  async pausePrimaryMarket(
    @Param("marketContractId") marketContractId: string,
    @Body() request: PausePrimaryMarketTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, marketContractId),
    )
  }
}
