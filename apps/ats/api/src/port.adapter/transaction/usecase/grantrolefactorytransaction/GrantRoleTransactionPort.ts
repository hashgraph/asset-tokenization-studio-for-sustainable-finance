// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "./model/GrantRoleTransactionRequest"

export interface GrantRoleTransactionPort {
  grantRole(
    factoryContractId: string,
    roleId: string,
    userId: string,
    request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
