// SPDX-License-Identifier: Apache-2.0

import { PageResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteRedemptionTransactionRequest } from "@port/transaction/usecase/executeredemption/model/ExecuteRedemptionTransactionRequest"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"

export interface ExecuteRedemptionTransactionPort {
  executeRedemption(
    treasuryContractId: string,
    request: ExecuteRedemptionTransactionRequest,
    pageOptions: TransactionPageOptionsRequest,
  ): Promise<PageResponse<string>>
}
