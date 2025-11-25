// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReleaseHoldRequest } from "./model/ReleaseHoldRequest"

export interface ReleaseHoldPort {
  releaseHold(
    bondContractId: string,
    holderAccountId: string,
    holdId: number,
    request: ReleaseHoldRequest,
  ): Promise<TransactionResponse>
}
