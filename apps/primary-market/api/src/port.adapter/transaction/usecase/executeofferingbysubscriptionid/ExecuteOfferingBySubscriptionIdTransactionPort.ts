// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingBySubscriptionIdTransactionRequest } from "./model/ExecuteOfferingBySubscriptionIdTransactionRequest"

export interface ExecuteOfferingBySubscriptionIdTransactionPort {
  executeOfferingBySubscriptionIdTransaction(
    marketContractId: string,
    offeringId: number,
    request: ExecuteOfferingBySubscriptionIdTransactionRequest,
  ): Promise<TransactionResponse>
}
