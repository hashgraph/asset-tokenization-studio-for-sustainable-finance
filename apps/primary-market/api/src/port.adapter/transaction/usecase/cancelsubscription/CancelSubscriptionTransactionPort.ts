// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelSubscriptionTransactionRequest } from "./model/CancelSubscriptionTransactionRequest"

export interface CancelSubscriptionTransactionPort {
  cancelSubscriptionTransaction(
    marketContractId: string,
    offeringId: number,
    request: CancelSubscriptionTransactionRequest,
  ): Promise<TransactionResponse>
}
