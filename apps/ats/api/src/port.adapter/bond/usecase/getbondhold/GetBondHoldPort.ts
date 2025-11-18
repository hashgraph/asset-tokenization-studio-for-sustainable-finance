// SPDX-License-Identifier: Apache-2.0

import { BondHoldResponse } from "./model/BondHoldResponse"

export interface GetBondHoldPort {
  getBondHold(bondContractId: string, holderAccountId: string, holdId: number): Promise<BondHoldResponse>
}
