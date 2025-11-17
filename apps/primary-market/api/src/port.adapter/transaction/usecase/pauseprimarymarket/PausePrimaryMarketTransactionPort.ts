// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { PausePrimaryMarketTransactionRequest } from "./model/PausePrimaryMarketTransactionRequest"

export interface PausePrimaryMarketTransactionPort {
  pausePrimaryMarket(
    marketContractId: string,
    request: PausePrimaryMarketTransactionRequest,
  ): Promise<TransactionResponse>
}
