// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingBySubscriptionIdTransactionRequest } from "./model/CancelOfferingBySubscriptionIdTransactionRequest"

export interface CancelOfferingBySubscriptionIdTransactionPort {
  cancelOfferingBySubscriptionIdTransaction(
    marketContractId: string,
    offeringId: number,
    request: CancelOfferingBySubscriptionIdTransactionRequest,
  ): Promise<TransactionResponse>
}
