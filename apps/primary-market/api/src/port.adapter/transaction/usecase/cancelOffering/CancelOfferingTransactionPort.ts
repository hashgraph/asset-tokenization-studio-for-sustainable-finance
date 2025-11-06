// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingTransactionRequest } from "./model/CancelOfferingTransactionRequest"

export interface CancelOfferingTransactionPort {
  cancelOfferingTransaction(
    marketContractId: string,
    offeringDltId: string,
    request: CancelOfferingTransactionRequest,
  ): Promise<TransactionResponse>
}
