// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UnpausePrimaryMarketTransactionRequest } from "./model/UnpausePrimaryMarketTransactionRequest"

export interface UnpausePrimaryMarketTransactionPort {
  unpausePrimaryMarket(
    marketContractId: string,
    request: UnpausePrimaryMarketTransactionRequest,
  ): Promise<TransactionResponse>
}
