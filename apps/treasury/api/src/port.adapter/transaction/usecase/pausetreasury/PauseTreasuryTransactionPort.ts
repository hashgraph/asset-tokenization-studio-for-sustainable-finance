// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { PauseTreasuryTransactionRequest } from "./model/PauseTreasuryTransactionRequest"

export interface PauseTreasuryTransactionPort {
  pauseTreasury(treasuryContractId: string, request: PauseTreasuryTransactionRequest): Promise<TransactionResponse>
}
