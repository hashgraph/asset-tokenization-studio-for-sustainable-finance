// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post, Query } from "@nestjs/common"
import { PageResponse, QueryPageOptions, RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteDistributionTransactionPort } from "@port/transaction/usecase/executedistribution/ExecuteDistributionTransactionPort"
import { ExecuteDistributionTransactionRequest } from "@port/transaction/usecase/executedistribution/model/ExecuteDistributionTransactionRequest"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"
import { ExecuteDistributionTransactionAppService } from "@app/transaction/executedistribution/ExecuteDistributionTransactionAppService"
import { ExecuteDistributionTransactionAppServiceRequest } from "@app/transaction/executedistribution/model/ExecuteDistributionTransactionAppServiceRequest"
import { plainToInstance } from "class-transformer"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class ExecuteDistributionTransactionHttpAdapter implements ExecuteDistributionTransactionPort {
  constructor(private readonly executeDistributionTransactionAppService: ExecuteDistributionTransactionAppService) {}

  @ApiOperation({
    summary:
      "Executes a distribution paginated by transactions. " +
      "Each transaction is a batch in which many holders will be paid based on maxBatchSize",
  })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/distributions/:distributionId")
  async executeDistribution(
    @Param("treasuryId") treasuryContractId: string,
    @Param("distributionId") distributionId: number,
    @Body() request: ExecuteDistributionTransactionRequest,
    @Query() pageOptions: TransactionPageOptionsRequest,
  ): Promise<PageResponse<string>> {
    return await this.executeDistributionTransactionAppService.execute(
      new ExecuteDistributionTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        distributionId,
        request.maxBatchSize!,
        plainToInstance(QueryPageOptions, pageOptions),
      ),
    )
  }
}
