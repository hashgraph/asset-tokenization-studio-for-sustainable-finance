// SPDX-License-Identifier: Apache-2.0
import { ClearingTransferResponse } from "./model/ClearingTransferResponse"

export interface GetClearingTransferPort {
  getClearing(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingTransferResponse>
}
