// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Offering } from "../model/Offering"

export interface OfferingRepository {
  save(offering: Offering): Promise<Offering>
  findByOfferingIdAndMarketId(offeringId: number, marketId: string): Promise<Offering | null>
  findUniqueBondContractIdsByMarketId(marketId: string, pageOptions: PageOptions): Promise<Page<string>>
  findByMarketIdAndBondContractId(
    marketId: string,
    bondContractId: string,
    pageOptions: PageOptions,
  ): Promise<Page<Offering>>
}
