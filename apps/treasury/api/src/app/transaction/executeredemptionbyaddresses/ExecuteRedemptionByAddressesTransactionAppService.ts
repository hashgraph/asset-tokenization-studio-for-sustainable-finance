// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { ExecuteRedemptionByAddressesTransactionAppServiceRequest } from "@app/transaction/executeredemptionbyaddresses/model/ExecuteRedemptionByAddressesTransactionAppServiceRequest"
import { MultipleTransactionAppServiceResponse } from "@app/transaction/shared/model/MultipleTransactionAppServiceResponse"

@Singleton()
export class ExecuteRedemptionByAddressesTransactionAppService {
  constructor(
    @Inject("TransactionBuilderPort") private readonly transactionBuilderPort: TransactionBuilderPort,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(
    request: ExecuteRedemptionByAddressesTransactionAppServiceRequest,
  ): Promise<MultipleTransactionAppServiceResponse> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.contractId)

    return await this.transactionBuilderPort.executeBondRedemptionByAddresses({
      contractId: request.contractId,
      format: request.format,
      accountId: request.accountId,
      maxBatchSize: request.maxBatchSize,
      bondContractId: treasury.bondContractId,
      holdersAccountIds: request.holdersAccountIds,
    })
  }
}
