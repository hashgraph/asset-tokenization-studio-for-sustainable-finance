// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post, Query } from "@nestjs/common"
import { PageResponse, QueryPageOptions, RestController } from "@hashgraph/green-bonds-shared-core"
import { ExecuteRedemptionTransactionPort } from "@port/transaction/usecase/executeredemption/ExecuteRedemptionTransactionPort"
import { ExecuteRedemptionTransactionRequest } from "@port/transaction/usecase/executeredemption/model/ExecuteRedemptionTransactionRequest"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"
import { ExecuteRedemptionTransactionAppService } from "@app/transaction/executeredemption/ExecuteRedemptionTransactionAppService"
import { ExecuteRedemptionTransactionAppServiceRequest } from "@app/transaction/executeredemption/model/ExecuteRedemptionTransactionAppServiceRequest"
import { plainToInstance } from "class-transformer"

@RestController("treasuries")
export class ExecuteRedemptionTransactionHttpAdapter implements ExecuteRedemptionTransactionPort {
  constructor(private readonly executeRedemptionTransactionAppService: ExecuteRedemptionTransactionAppService) {}

  @Post(":treasuryContractId/redemptions")
  async executeRedemption(
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: ExecuteRedemptionTransactionRequest,
    @Query() pageOptions: TransactionPageOptionsRequest,
  ): Promise<PageResponse<string>> {
    return await this.executeRedemptionTransactionAppService.execute(
      new ExecuteRedemptionTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        plainToInstance(QueryPageOptions, pageOptions),
        request.maxBatchSize,
      ),
    )
  }
}
