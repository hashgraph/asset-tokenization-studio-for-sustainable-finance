// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UnpausePrimaryMarketFactoryTransactionRequest } from "./model/UnpausePrimaryMarketFactoryTransactionRequest"

export interface UnpausePrimaryMarketFactoryTransactionPort {
  unpauseFactory(
    factoryContractId: string,
    request: UnpausePrimaryMarketFactoryTransactionRequest,
  ): Promise<TransactionResponse>
}
