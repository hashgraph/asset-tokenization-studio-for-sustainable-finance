// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingTransactionRequest } from "./model/ExecuteOfferingTransactionRequest"

export interface ExecuteOfferingTransactionPort {
  executeOfferingTransaction(
    marketContractId: string,
    offeringId: string,
    request: ExecuteOfferingTransactionRequest,
  ): Promise<TransactionResponse>
}
