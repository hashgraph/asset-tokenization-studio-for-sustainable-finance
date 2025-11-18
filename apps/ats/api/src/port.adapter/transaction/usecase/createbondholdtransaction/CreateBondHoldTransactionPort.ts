// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondHoldTransactionRequest } from "./model/CreateBondHoldTransactionRequest"

export interface CreateBondHoldTransactionPort {
  createBondHoldTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: CreateBondHoldTransactionRequest,
  ): Promise<TransactionResponse>
}
