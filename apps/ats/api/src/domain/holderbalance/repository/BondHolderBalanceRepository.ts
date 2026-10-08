// SPDX-License-Identifier: Apache-2.0
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondHolderBalance } from "../model/BondHolderBalance"

export interface BondHolderBalanceRepository {
  save(bondHolderBalance: BondHolderBalance, transactionId?: string): Promise<BondHolderBalance>
  findByContractIdHolderAccountIdAndPartition(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
  ): Promise<BondHolderBalance | null>
  findAllByContractIdPaginated(bondContractId: string, pageOptions: PageOptions): Promise<Page<BondHolderBalance>>
  findAllByContractIdAndHolderAccountIdPaginated(
    bondContractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<BondHolderBalance>>
}
