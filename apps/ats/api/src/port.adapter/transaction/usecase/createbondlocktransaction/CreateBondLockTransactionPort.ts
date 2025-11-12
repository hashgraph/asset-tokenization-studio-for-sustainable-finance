// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondLockTransactionRequest } from "./model/CreateBondLockTransactionRequest"

export interface CreateBondLockTransactionPort {
  createBondLockTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: CreateBondLockTransactionRequest,
  ): Promise<TransactionResponse>
}
