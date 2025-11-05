// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Offering } from "../model/Offering"

export interface OfferingRepository {
  save(offering: Offering): Promise<Offering>
  findByOfferingIdAndMarketId(offeringId: string, marketId: string): Promise<Offering | null>
  findUniqueBondIdsByMarketId(marketId: string, pageOptions: PageOptions): Promise<Page<string>>
  findByMarketIdAndBondId(marketId: string, bondId: string, pageOptions: PageOptions): Promise<Page<Offering>>
}
