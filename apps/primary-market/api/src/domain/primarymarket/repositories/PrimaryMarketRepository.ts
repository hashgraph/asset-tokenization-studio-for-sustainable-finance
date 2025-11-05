// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface PrimaryMarketRepository {
  findByContractId(contractId: string): Promise<PrimaryMarket | null>
  findAll(pageOptions: PageOptions): Promise<Page<PrimaryMarket>>
}
