// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { MintBondTransactionRequest } from "./model/MintBondTransactionRequest"

export interface MintBondTransactionPort {
  mintBondTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: MintBondTransactionRequest,
  ): Promise<TransactionResponse>
}
