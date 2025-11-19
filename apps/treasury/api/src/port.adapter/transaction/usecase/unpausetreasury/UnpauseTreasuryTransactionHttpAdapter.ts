// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  RestController,
  TransactionResponse,
  UnpauseTransactionAppService,
  UnpauseTransactionAppServiceRequest,
} from "@hashgraph/green-bonds-shared-core"

import { UnpauseTreasuryTransactionRequest } from "./model/UnpauseTreasuryTransactionRequest"
import { UnpauseTreasuryTransactionPort } from "@port/transaction/usecase/unpausetreasury/UnpauseTreasuryTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class UnpauseTreasuryTransactionHttpAdapter implements UnpauseTreasuryTransactionPort {
  constructor(private readonly unpauseTransactionAppService: UnpauseTransactionAppService) {}

  @ApiOperation({ summary: "Unpauses a treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/unpause")
  async unpauseTreasury(
    @Param("treasuryId") treasuryContractId: string,
    @Body() request: UnpauseTreasuryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTransactionAppService.execute(
      new UnpauseTransactionAppServiceRequest(request.format, request.accountId!, treasuryContractId),
    )
  }
}
