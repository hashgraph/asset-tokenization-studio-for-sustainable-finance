// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { GrantRoleTransactionRequest } from "@port/transaction/usecase/grantrole/model/GrantRoleTransactionRequest"

export interface RevokeRoleTransactionPort {
  revokeRole(
    treasuryContractId: string,
    roleId: string,
    userAccountId: string,
    request: GrantRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
