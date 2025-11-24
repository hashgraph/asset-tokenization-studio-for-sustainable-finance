// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RevokePrimaryMarketFactoryRoleTransactionRequest } from "./model/RevokePrimaryMarketFactoryRoleTransactionRequest"

export interface RevokePrimaryMarketFactoryRoleTransactionPort {
  revokePrimaryMarketFactoryRole(
    factoryContractId: string,
    roleId: string,
    userAccountId: string,
    request: RevokePrimaryMarketFactoryRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
