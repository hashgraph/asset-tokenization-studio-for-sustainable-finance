// SPDX-License-Identifier: Apache-2.0

import { Inject, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExecuteDistributionTransactionAppServiceRequest } from "./model/ExecuteDistributionTransactionAppServiceRequest"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"

@Singleton()
export class ExecuteDistributionTransactionAppService {
  constructor(
    @Inject() private readonly transactionBuilderPort: TransactionBuilderPort,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(request: ExecuteDistributionTransactionAppServiceRequest): Promise<QueryPageResponse<string>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.contractId)

    return await this.transactionBuilderPort.executeDistribution({
      contractId: request.contractId,
      format: request.format,
      accountId: request.accountId,
      bondContractId: treasury.bondContractId,
      distributionId: request.distributionId,
      maxBatchSize: request.maxBatchSize,
      pageOptions: new TransactionPageOptionsRequest(request.pageOptions.page, request.pageOptions.limit),
    })
  }
}
