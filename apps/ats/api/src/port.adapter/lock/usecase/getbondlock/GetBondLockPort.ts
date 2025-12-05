// SPDX-License-Identifier: Apache-2.0
import { BondLockResponse } from "./model/BondLockResponse"

export interface GetBondLockPort {
  getBondLock(bondContractId: string, holderAccountId: string, lockId: number): Promise<BondLockResponse>
}
