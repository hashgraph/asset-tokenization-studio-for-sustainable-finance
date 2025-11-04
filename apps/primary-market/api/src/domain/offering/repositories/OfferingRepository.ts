// SPDX-License-Identifier: Apache-2.0

import { Offering } from "../model/Offering"

export interface OfferingRepository {
  save(offering: Offering): Promise<Offering>
  findByOfferingIdAndMarketId(offeringId: string, marketId: string): Promise<Offering | null>
}
