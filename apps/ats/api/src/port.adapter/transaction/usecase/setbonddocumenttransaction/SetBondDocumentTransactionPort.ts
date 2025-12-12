// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetBondDocumentTransactionRequest } from "@port/transaction/usecase/setbonddocumenttransaction/model/SetBondDocumentTransactionRequest"

export interface SetBondDocumentTransactionPort {
  setBondDocumentTransaction(
    bondContractId: string,
    name: string,
    request: SetBondDocumentTransactionRequest,
  ): Promise<TransactionResponse>
}
