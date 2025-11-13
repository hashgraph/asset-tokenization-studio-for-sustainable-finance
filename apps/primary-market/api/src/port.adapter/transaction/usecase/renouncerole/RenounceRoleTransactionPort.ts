// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RenounceRoleTransactionRequest } from "./model/RenounceRoleTransactionRequest"

export interface RenounceRoleTransactionPort {
  renounceRole(
    marketContractId: string,
    roleId: string,
    request: RenounceRoleTransactionRequest,
  ): Promise<TransactionResponse>
}
