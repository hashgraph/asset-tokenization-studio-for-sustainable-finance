// SPDX-License-Identifier: Apache-2.0
import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildCreateBondTransactionRequest } from "./model/BuildCreateBondTransactionRequest"
import { BuildSetBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildSetBondDocumentTransactionRequest"

export interface TransactionBuilderPort {
  createBondTransaction(request: BuildCreateBondTransactionRequest): Promise<BuildTransactionResponse>
  setBondDocumentTransaction(request: BuildSetBondDocumentTransactionRequest): Promise<BuildTransactionResponse>
}
