// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RevokeRoleTransactionRequest } from "./model/RevokeRoleTransactionRequest"

export interface RevokeRoleTransactionPort {
  revokeRole(
    factoryId: string,
    roleId: string,
    userId: string,
    request: RevokeRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
