// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveBondDocumentTransactionRequest } from "./model/RemoveBondDocumentTransactionRequest"

export interface RemoveBondDocumentTransactionPort {
  removeBondDocumentTransaction(
    contractId: string,
    name: string,
    request: RemoveBondDocumentTransactionRequest,
  ): Promise<TransactionResponse>
}
