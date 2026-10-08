// SPDX-License-Identifier: Apache-2.0
import { ClearingHoldResponse } from "./model/ClearingHoldResponse"

export interface GetClearingHoldPort {
  getClearing(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingHoldResponse>
}
