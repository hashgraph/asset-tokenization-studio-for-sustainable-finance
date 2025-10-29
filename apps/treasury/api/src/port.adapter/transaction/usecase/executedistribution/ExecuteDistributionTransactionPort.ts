// SPDX-License-Identifier: Apache-2.0

import { PageResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteDistributionTransactionRequest } from "@port/transaction/usecase/executedistribution/model/ExecuteDistributionTransactionRequest"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"

export interface ExecuteDistributionTransactionPort {
  executeDistribution(
    treasuryContractId: string,
    distributionId: number,
    request: ExecuteDistributionTransactionRequest,
    pageOptions: TransactionPageOptionsRequest,
  ): Promise<PageResponse<string>>
}
