// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SubmitSubscriptionTransactionRequest } from "./model/SubmitSubscriptionTransactionRequest"

export interface SubmitSubscriptionTransactionPort {
  submitSubscriptionTransaction(
    marketContractId: string,
    offeringId: string,
    request: SubmitSubscriptionTransactionRequest,
  ): Promise<TransactionResponse>
}
