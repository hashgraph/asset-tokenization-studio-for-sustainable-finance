// SPDX-License-Identifier: Apache-2.0
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"

export interface ClearingRedeemRepository {
  save(clearing: ClearingRedeem): Promise<ClearingRedeem>
  findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingRedeem | null>
  findAllByHolder(
    bondContractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<ClearingRedeem>>
  update(clearing: ClearingRedeem): Promise<ClearingRedeem>
  deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void>
}
