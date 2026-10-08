// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UnpauseBondTransactionRequest } from "@port/transaction/usecase/unpausebond/model/UnpauseBondTransactionRequest"

export interface UnpauseBondTransactionPort {
  unpauseBond(bondContractId: string, request: UnpauseBondTransactionRequest): Promise<TransactionResponse>
}
