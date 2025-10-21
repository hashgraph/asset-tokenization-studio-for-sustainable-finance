// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "./model/GrantRoleTransactionRequest"

export interface GrantRoleTransactionPort {
  grantRoleTransaction(
    marketContractId: string,
    roleId: string,
    userAccountId: string,
    request: GrantRoleTransactionRequest,
  ): TransactionResponse
}
