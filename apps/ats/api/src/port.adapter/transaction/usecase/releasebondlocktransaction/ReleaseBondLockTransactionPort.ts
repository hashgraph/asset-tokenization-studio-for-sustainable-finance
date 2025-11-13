// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockTransactionRequest } from "./model/ReleaseBondLockTransactionRequest"

export interface ReleaseBondLockTransactionPort {
  releaseBondLockTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: ReleaseBondLockTransactionRequest,
  ): Promise<TransactionResponse>
}
