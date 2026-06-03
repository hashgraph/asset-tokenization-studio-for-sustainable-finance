// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetKpiInterestRateTransactionRequest } from "@port/transaction/usecase/setkpiinterestratetransaction/model/SetKpiInterestRateTransactionRequest"

export interface SetKpiInterestRateTransactionPort {
  setInterestRateTransaction(
    bondContractId: string,
    request: SetKpiInterestRateTransactionRequest,
  ): Promise<TransactionResponse>
}
