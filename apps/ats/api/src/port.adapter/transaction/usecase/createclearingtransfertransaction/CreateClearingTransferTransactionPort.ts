// SPDX-License-Identifier: Apache-2.0
import type { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import type { CreateClearingTransferTransactionRequest } from "./model/CreateClearingTransferTransactionRequest"

export interface CreateClearingTransferTransactionPort {
  createClearingTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: CreateClearingTransferTransactionRequest,
  ): Promise<TransactionResponse>
}
