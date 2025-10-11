import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildCreateBondTransactionRequest } from "./model/BuildCreateBondTransactionRequest"

export interface TransactionBuilderPort {
  createBondTransaction(request: BuildCreateBondTransactionRequest): BuildTransactionResponse
}
