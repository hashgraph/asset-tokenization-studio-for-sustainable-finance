// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddControlListMemberTransactionRequest } from "./model/AddControlListMemberTransactionRequest"

export interface AddControlListMemberTransactionPort {
  addControlListMemberTransaction(
    contractId: string,
    holderId: string,
    request: AddControlListMemberTransactionRequest,
  ): Promise<TransactionResponse>
}
