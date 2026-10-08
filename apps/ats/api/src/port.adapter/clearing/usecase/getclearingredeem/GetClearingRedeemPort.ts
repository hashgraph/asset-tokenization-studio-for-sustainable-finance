// SPDX-License-Identifier: Apache-2.0
import { ClearingRedeemResponse } from "./model/ClearingRedeemResponse"

export interface GetClearingRedeemPort {
  getClearing(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingRedeemResponse>
}
