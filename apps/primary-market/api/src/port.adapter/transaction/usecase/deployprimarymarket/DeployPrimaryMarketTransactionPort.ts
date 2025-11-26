// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DeployPrimaryMarketTransactionRequest } from "./model/DeployPrimaryMarketTransactionRequest"

export interface DeployPrimaryMarketTransactionPort {
  deployPrimaryMarketTransaction(request: DeployPrimaryMarketTransactionRequest): Promise<TransactionResponse>
}
