// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ApplyRolesTransactionRequest } from "./model/ApplyRolesTransactionRequest"

export interface ApplyRolesTransactionPort {
  applyRoles(
    marketContractId: string,
    userAccountId: string,
    request: ApplyRolesTransactionRequest,
  ): Promise<TransactionResponse>
}
