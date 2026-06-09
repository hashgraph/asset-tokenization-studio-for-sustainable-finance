// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetKpiImpactDataTransactionRequest } from "@port/transaction/usecase/setkpiimpactdatatransaction/model/SetKpiImpactDataTransactionRequest"

export interface SetKpiImpactDataTransactionPort {
  setImpactDataTransaction(
    bondContractId: string,
    request: SetKpiImpactDataTransactionRequest,
  ): Promise<TransactionResponse>
}
