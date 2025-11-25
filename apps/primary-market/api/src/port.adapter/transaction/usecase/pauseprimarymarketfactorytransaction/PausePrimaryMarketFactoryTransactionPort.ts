// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { PausePrimaryMarketFactoryTransactionRequest } from "./model/PausePrimaryMarketFactoryTransactionRequest"

export interface PausePrimaryMarketFactoryTransactionPort {
  pauseFactory(
    factoryContractId: string,
    request: PausePrimaryMarketFactoryTransactionRequest,
  ): Promise<TransactionResponse>
}
