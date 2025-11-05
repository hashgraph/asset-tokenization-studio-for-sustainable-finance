// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DeleteControlListMemberTransactionRequest } from "./model/DeleteControlListMemberTransactionRequest"

export interface DeleteControlListMemberTransactionPort {
  deleteControlListMemberTransaction(
    contractId: string,
    holderId: string,
    request: DeleteControlListMemberTransactionRequest,
  ): Promise<TransactionResponse>
}
