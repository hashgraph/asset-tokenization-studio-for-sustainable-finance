// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelClearingTransactionRequest } from "./model/CancelClearingTransactionRequest"

export interface CancelClearingTransactionPort {
  cancelClearingTransaction(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
    request: CancelClearingTransactionRequest,
  ): Promise<TransactionResponse>
}
