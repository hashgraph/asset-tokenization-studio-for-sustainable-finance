// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post, Query } from "@nestjs/common"
import { PageResponse, QueryPageOptions, RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteRedemptionTransactionPort } from "@port/transaction/usecase/executeredemption/ExecuteRedemptionTransactionPort"
import { ExecuteRedemptionTransactionRequest } from "@port/transaction/usecase/executeredemption/model/ExecuteRedemptionTransactionRequest"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"
import { ExecuteRedemptionTransactionAppService } from "@app/transaction/executeredemption/ExecuteRedemptionTransactionAppService"
import { ExecuteRedemptionTransactionAppServiceRequest } from "@app/transaction/executeredemption/model/ExecuteRedemptionTransactionAppServiceRequest"
import { plainToInstance } from "class-transformer"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class ExecuteRedemptionTransactionHttpAdapter implements ExecuteRedemptionTransactionPort {
  constructor(private readonly executeRedemptionTransactionAppService: ExecuteRedemptionTransactionAppService) {}

  @ApiOperation({
    summary:
      "Executes a redemption paginated by transactions. " +
      "Each transaction is a batch in which many holders will be paid based on maxBatchSize",
  })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/redemptions")
  async executeRedemption(
    @Param("treasuryId") treasuryContractId: string,
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
