// SPDX-License-Identifier: Apache-2.0
import { GetClearingResponse } from "./model/GetClearingResponse"

export interface GetClearingPort {
  getClearing(bondContractId: string, holderAccountId: string, clearingId: number): Promise<GetClearingResponse>
}
