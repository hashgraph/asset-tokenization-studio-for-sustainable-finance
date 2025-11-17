// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RedeemBondTransactionRequest } from "./model/RedeemBondTransactionRequest"

export interface RedeemBondTransactionPort {
  redeemBondTransaction(bondContractId: string, request: RedeemBondTransactionRequest): Promise<TransactionResponse>
}
