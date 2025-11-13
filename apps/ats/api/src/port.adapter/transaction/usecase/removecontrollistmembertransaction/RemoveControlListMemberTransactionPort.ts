// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveControlListMemberTransactionRequest } from "./model/RemoveControlListMemberTransactionRequest"

export interface RemoveControlListMemberTransactionPort {
  deleteControlListMemberTransaction(
    contractId: string,
    holderAccountId: string,
    request: RemoveControlListMemberTransactionRequest,
  ): Promise<TransactionResponse>
}
