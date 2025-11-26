// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { GrantPrimaryMarketFactoryRoleTransactionRequest } from "./model/GrantPrimaryMarketFactoryRoleTransactionRequest"

export interface GrantPrimaryMarketFactoryRoleTransactionPort {
  grantPrimaryMarketFactoryRole(
    factoryContractId: string,
    roleId: string,
    userAccountId: string,
    request: GrantPrimaryMarketFactoryRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
