// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetBondCapTransactionRequest } from "./model/SetBondCapTransactionRequest"

export interface SetBondCapTransactionPort {
  setBondCapTransaction(contractId: string, request: SetBondCapTransactionRequest): Promise<TransactionResponse>
}
