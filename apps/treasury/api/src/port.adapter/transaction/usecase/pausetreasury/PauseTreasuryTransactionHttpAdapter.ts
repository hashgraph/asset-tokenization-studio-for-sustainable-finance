// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { PauseTreasuryTransactionRequest } from "./model/PauseTreasuryTransactionRequest"
import { PauseTreasuryTransactionAppService } from "@app/transaction/pausetreasury/service/PauseTreasuryTransactionAppService"
import { PauseTreasuryTransactionAppServiceRequest } from "@app/transaction/pausetreasury/service/model/PauseTreasuryTransactionAppServiceRequest"
import { PauseTreasuryTransactionPort } from "@port/transaction/usecase/pausetreasury/PauseTreasuryTransactionPort"

@RestController("treasuries")
export class PauseTreasuryTransactionHttpAdapter implements PauseTreasuryTransactionPort {
  constructor(private readonly pauseTreasuryTransactionAppService: PauseTreasuryTransactionAppService) {}

  @Post(":treasuryContractId/pause")
  async pauseTreasury(
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: PauseTreasuryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTreasuryTransactionAppService.execute(
      new PauseTreasuryTransactionAppServiceRequest(request.format, request.accountId || "", treasuryContractId),
    )
  }
}
