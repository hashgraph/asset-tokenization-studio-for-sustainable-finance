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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class PauseTreasuryTransactionHttpAdapter implements PauseTreasuryTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @ApiOperation({ summary: "Pauses a treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/pause")
  async pauseTreasury(
    @Param("treasuryId") treasuryContractId: string,
    @Body() request: PauseTreasuryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, treasuryContractId),
    )
  }
}
