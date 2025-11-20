// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { PauseBondTransactionRequest } from "@port/transaction/usecase/pausebondtransaction/model/PauseBondTransactionRequest"

export interface PauseBondTransactionPort {
  pauseBond(bondContractId: string, request: PauseBondTransactionRequest): Promise<TransactionResponse>
}
