// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { UnpauseTreasuryTransactionRequest } from "./model/UnpauseTreasuryTransactionRequest"
import { UnpauseTreasuryTransactionAppService } from "@app/transaction/unpausetreasury/service/UnpauseTreasuryTransactionAppService"
import { UnpauseTreasuryTransactionAppServiceRequest } from "@app/transaction/unpausetreasury/service/model/UnpauseTreasuryTransactionAppServiceRequest"
import { UnpauseTreasuryTransactionPort } from "@port/transaction/usecase/unpausetreasury/UnpauseTreasuryTransactionPort"

@RestController("treasuries")
export class UnpauseTreasuryTransactionHttpAdapter implements UnpauseTreasuryTransactionPort {
  constructor(private readonly unpauseTreasuryTransactionAppService: UnpauseTreasuryTransactionAppService) {}

  @Post(":treasuryContractId/unpause")
  async unpauseTreasury(
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: UnpauseTreasuryTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTreasuryTransactionAppService.execute(
      new UnpauseTreasuryTransactionAppServiceRequest(request.format, request.accountId || "", treasuryContractId),
    )
  }
}
