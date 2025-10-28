// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { TransferPaymentTokenTransactionRequest } from "./model/TransferPaymentTokenTransactionRequest"

export interface TransferPaymentTokenTransactionPort {
  transferPaymentToken(
    treasuryContractId: string,
    request: TransferPaymentTokenTransactionRequest,
  ): Promise<TransactionResponse>
}
