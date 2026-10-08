// SPDX-License-Identifier: Apache-2.0

import { Inject, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExecuteRedemptionTransactionAppServiceRequest } from "./model/ExecuteRedemptionTransactionAppServiceRequest"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"
import { plainToInstance } from "class-transformer"

@Singleton()
export class ExecuteRedemptionTransactionAppService {
  constructor(
    @Inject() private readonly transactionBuilderPort: TransactionBuilderPort,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(request: ExecuteRedemptionTransactionAppServiceRequest): Promise<QueryPageResponse<string>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.contractId)

    return await this.transactionBuilderPort.executeRedemption({
      contractId: request.contractId,
      format: request.format,
      accountId: request.accountId,
      bondContractId: treasury.bondContractId,
      maxBatchSize: request.maxBatchSize,
      pageOptions: plainToInstance(TransactionPageOptionsRequest, {
        page: request.pageOptions.page,
        limit: request.pageOptions.limit,
      }),
    })
  }
}
