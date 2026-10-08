// SPDX-License-Identifier: Apache-2.0

import type { BondHold } from "../model/BondHold"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondHoldRepository {
  save(bondHold: BondHold, transactionId?: string): Promise<BondHold>
  findById(id: number, bondContractId: string, holderAccountId: string, partition: string): Promise<BondHold | null>
  findByContractIdAndHolderAndHoldId(
    bondContractId: string,
    holderAccountId: string,
    holdId: number,
    partition: string,
  ): Promise<BondHold | null>
  findByContractIdAndHolder(
    bondContractId: string,
    holderAccountId: string,
    page: number,
    pageSize: number,
  ): Promise<BondHold[]>
  countByContractIdAndHolder(bondContractId: string, holderAccountId: string): Promise<number>
  findByContractIdAndHolderPaginated(
    bondContractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<BondHold>>
  deleteByIdAndContractIdAndHolderAccountId(
    id: number,
    bondContractId: string,
    holderAccountId: string,
    partition: string,
  ): Promise<void>
}
