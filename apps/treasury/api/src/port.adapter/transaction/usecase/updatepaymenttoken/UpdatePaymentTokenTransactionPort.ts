// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UpdatePaymentTokenTransactionRequest } from "./model/UpdatePaymentTokenTransactionRequest"

export interface UpdatePaymentTokenTransactionPort {
  updatePaymentToken(treasuryContractId: string, request: UpdatePaymentTokenTransactionRequest): TransactionResponse
}
