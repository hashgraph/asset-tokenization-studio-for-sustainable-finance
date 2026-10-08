// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DissociatePaymentTokenTransactionRequest } from "./model/DissociatePaymentTokenTransactionRequest"

export interface DissociatePaymentTokenTransactionPort {
  dissociatePaymentToken(
    treasuryContractId: string,
    paymentTokenContractId: string,
    request: DissociatePaymentTokenTransactionRequest,
  ): Promise<TransactionResponse>
}
