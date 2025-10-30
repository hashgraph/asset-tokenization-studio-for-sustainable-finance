// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { ExecuteDistributionByAddressesTransactionAppServiceRequest } from "@app/transaction/executedistributionbyaddresses/model/ExecuteDistributionByAddressesTransactionAppServiceRequest"
import { MultipleTransactionAppServiceResponse } from "@app/transaction/shared/model/MultipleTransactionAppServiceResponse"

@Singleton()
export class ExecuteDistributionByAddressesTransactionAppService {
  constructor(
    @Inject() private readonly transactionBuilderPort: TransactionBuilderPort,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(
    request: ExecuteDistributionByAddressesTransactionAppServiceRequest,
  ): Promise<MultipleTransactionAppServiceResponse> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.contractId)

    return await this.transactionBuilderPort.executeDistributionByAddresses({
      contractId: request.contractId,
      format: request.format,
      accountId: request.accountId,
      distributionId: request.distributionId,
      maxBatchSize: request.maxBatchSize,
      bondContractId: treasury.bondContractId,
      holdersAccountIds: request.holdersAccountIds,
    })
  }
}
