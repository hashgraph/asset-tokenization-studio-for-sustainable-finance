// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { PauseFactoryTransactionRequest } from "./model/PauseFactoryTransactionRequest"

export interface PauseFactoryTransactionPort {
  pauseFactory(factoryId: string, request: PauseFactoryTransactionRequest): Promise<TransactionResponse>
}
