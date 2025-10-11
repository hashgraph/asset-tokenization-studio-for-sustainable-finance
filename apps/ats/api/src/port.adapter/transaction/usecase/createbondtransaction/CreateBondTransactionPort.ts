// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondTransactionRequest } from "./model/CreateBondTransactionRequest"

export interface CreateBondTransactionPort {
  createBondTransaction(factoryId: string, request: CreateBondTransactionRequest): TransactionResponse
}
