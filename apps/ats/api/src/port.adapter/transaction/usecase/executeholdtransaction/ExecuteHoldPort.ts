// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteHoldRequest } from "./model/ExecuteHoldRequest"

export interface ExecuteHoldPort {
  executeHold(
    bondContractId: string,
    holderAccountId: string,
    holdId: number,
    request: ExecuteHoldRequest,
  ): Promise<TransactionResponse>
}
