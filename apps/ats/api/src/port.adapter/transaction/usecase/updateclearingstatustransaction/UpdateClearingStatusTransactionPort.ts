// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UpdateClearingStatusTransactionRequest } from "./model/UpdateClearingStatusTransactionRequest"

export interface UpdateClearingStatusTransactionPort {
  updateClearingStatusTransaction(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
    request: UpdateClearingStatusTransactionRequest,
  ): Promise<TransactionResponse>
}
