// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UnpauseFactoryTransactionRequest } from "./model/UnpauseFactoryTransactionRequest"

export interface UnpauseFactoryTransactionPort {
  unpauseFactory(factoryId: string, request: UnpauseFactoryTransactionRequest): Promise<TransactionResponse>
}
