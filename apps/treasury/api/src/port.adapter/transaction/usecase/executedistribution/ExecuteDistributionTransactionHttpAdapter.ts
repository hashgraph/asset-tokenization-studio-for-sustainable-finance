// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post, Query } from "@nestjs/common"
import { PageResponse, QueryPageOptions, RestController } from "@hashgraph/green-bonds-shared-core"
import { ExecuteDistributionTransactionPort } from "@port/transaction/usecase/executedistribution/ExecuteDistributionTransactionPort"
import { ExecuteDistributionTransactionRequest } from "@port/transaction/usecase/executedistribution/model/ExecuteDistributionTransactionRequest"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"
import { ExecuteDistributionTransactionAppService } from "@app/transaction/executedistribution/ExecuteDistributionTransactionAppService"
import { ExecuteDistributionTransactionAppServiceRequest } from "@app/transaction/executedistribution/model/ExecuteDistributionTransactionAppServiceRequest"
import { plainToInstance } from "class-transformer"

@RestController("treasuries")
export class ExecuteDistributionTransactionHttpAdapter implements ExecuteDistributionTransactionPort {
  constructor(private readonly executeDistributionTransactionAppService: ExecuteDistributionTransactionAppService) {}

  @Post(":treasuryContractId/distributions/:distributionId")
  async executeDistribution(
    @Param("treasuryContractId") treasuryContractId: string,
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
