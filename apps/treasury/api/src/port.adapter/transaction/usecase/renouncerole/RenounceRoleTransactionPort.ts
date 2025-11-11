// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RenounceRoleTransactionRequest } from "@port/transaction/usecase/renouncerole/model/RenounceRoleTransactionRequest"

export interface RenounceRoleTransactionPort {
  renounceRole(
    treasuryContractId: string,
    roleId: string,
    request: RenounceRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
