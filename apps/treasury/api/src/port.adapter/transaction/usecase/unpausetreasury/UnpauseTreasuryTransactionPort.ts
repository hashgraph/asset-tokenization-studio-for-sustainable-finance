// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UnpauseTreasuryTransactionRequest } from "./model/UnpauseTreasuryTransactionRequest"

export interface UnpauseTreasuryTransactionPort {
  unpauseTreasury(treasuryContractId: string, request: UnpauseTreasuryTransactionRequest): Promise<TransactionResponse>
}
