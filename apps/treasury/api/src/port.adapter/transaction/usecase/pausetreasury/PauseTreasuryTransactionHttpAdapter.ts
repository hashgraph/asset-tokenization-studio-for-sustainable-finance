// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  PauseTransactionAppService,
  PauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { PauseTreasuryTransactionPort } from "@port/transaction/usecase/pausetreasury/PauseTreasuryTransactionPort"
import { PauseTreasuryTransactionRequest } from "@port/transaction/usecase/pausetreasury/model/PauseTreasuryTransactionRequest"

@RestController("treasuries")
export class PauseTreasuryTransactionHttpAdapter implements PauseTreasuryTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @Post(":treasuryContractId/pause")
  async pauseTreasury(
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: PauseTreasuryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, treasuryContractId),
    )
  }
}
