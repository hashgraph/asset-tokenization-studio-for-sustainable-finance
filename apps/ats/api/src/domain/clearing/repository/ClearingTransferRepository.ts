// SPDX-License-Identifier: Apache-2.0
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "../model/ClearingTransfer"

export interface ClearingTransferRepository {
  save(clearing: ClearingTransfer, transactionId?: string): Promise<ClearingTransfer>
  findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingTransfer | null>
  findAllByHolder(
    bondContractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<ClearingTransfer>>
  update(clearing: ClearingTransfer, transactionId?: string): Promise<ClearingTransfer>
  deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void>
}
