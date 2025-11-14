// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UpdateClearingHoldStatusTransactionRequest } from "./model/UpdateClearingHoldStatusTransactionRequest"

export interface UpdateClearingHoldStatusTransactionPort {
  updateClearingStatusTransaction(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
    request: UpdateClearingHoldStatusTransactionRequest,
  ): Promise<TransactionResponse>
}
