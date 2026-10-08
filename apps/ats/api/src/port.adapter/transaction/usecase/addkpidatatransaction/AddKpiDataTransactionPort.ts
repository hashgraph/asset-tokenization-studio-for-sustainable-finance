// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddKpiDataTransactionRequest } from "@port/transaction/usecase/addkpidatatransaction/model/AddKpiDataTransactionRequest"

export interface AddKpiDataTransactionPort {
  addKpiDataTransaction(bondContractId: string, request: AddKpiDataTransactionRequest): Promise<TransactionResponse>
}
