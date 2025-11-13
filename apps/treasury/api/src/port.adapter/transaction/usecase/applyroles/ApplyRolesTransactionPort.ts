// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ApplyRolesTransactionRequest } from "@port/transaction/usecase/applyroles/model/ApplyRolesTransactionRequest"

export interface ApplyRolesTransactionPort {
  applyRoles(
    treasuryContractId: string,
    userAccountId: string,
    request: ApplyRolesTransactionRequest,
  ): Promise<TransactionResponse>
}
