// SPDX-License-Identifier: Apache-2.0
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"

export interface ClearingHoldRepository {
  save(clearing: ClearingHold): Promise<ClearingHold>
  findById(id: string): Promise<ClearingHold | null>
  findByClearingId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingHold | null>
  findAllByHolder(bondContractId: string, holderAccountId: string, pageOptions: PageOptions): Promise<Page<ClearingHold>>
  update(clearing: ClearingHold): Promise<ClearingHold>
  delete(id: string): Promise<void>
}
