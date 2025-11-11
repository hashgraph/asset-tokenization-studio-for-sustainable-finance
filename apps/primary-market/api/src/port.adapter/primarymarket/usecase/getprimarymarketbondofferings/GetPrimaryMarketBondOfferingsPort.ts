// SPDX-License-Identifier: Apache-2.0

import { PageResponse } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarketBondOfferingResponse } from "./model/PrimaryMarketBondOfferingResponse"

export interface GetPrimaryMarketBondOfferingsPort {
  getPrimaryMarketBondOfferings(
    marketContractId: string,
    bondContractId: string,
    queryPageRequest: any,
  ): Promise<PageResponse<PrimaryMarketBondOfferingResponse>>
}
