// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingRedeemTransactionRequest } from "./model/CreateClearingRedeemTransactionRequest"

export interface CreateClearingRedeemTransactionPort {
  createClearingRedeemTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: CreateClearingRedeemTransactionRequest,
  ): Promise<TransactionResponse>
}
