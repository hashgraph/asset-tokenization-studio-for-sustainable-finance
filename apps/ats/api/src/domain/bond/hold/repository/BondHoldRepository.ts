// SPDX-License-Identifier: Apache-2.0

import type { BondHold } from "../model/BondHold"

export interface BondHoldRepository {
  save(bondHold: BondHold): Promise<BondHold>
  findById(id: number): Promise<BondHold | null>
  findByContractIdAndHolderAndHoldId(
    contractId: string,
    holderAccountId: string,
    holdId: number,
  ): Promise<BondHold | null>
  findByContractIdAndHolder(
    contractId: string,
    holderAccountId: string,
    page: number,
    pageSize: number,
  ): Promise<BondHold[]>
  countByContractIdAndHolder(contractId: string, holderAccountId: string): Promise<number>
}
