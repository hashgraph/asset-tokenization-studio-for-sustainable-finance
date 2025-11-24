// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReclaimHoldRequest } from "./model/ReclaimHoldRequest"

export interface ReclaimHoldPort {
  reclaimHold(
    bondContractId: string,
    holderAccountId: string,
    holdId: number,
    request: ReclaimHoldRequest,
  ): Promise<TransactionResponse>
}
