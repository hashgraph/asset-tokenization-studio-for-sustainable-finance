// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingHoldTransactionRequest } from "./model/CreateClearingHoldTransactionRequest"

export interface CreateClearingHoldTransactionPort {
  createClearingTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: CreateClearingHoldTransactionRequest,
  ): Promise<TransactionResponse>
}
