// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarketBondResponse } from "./model/PrimaryMarketBondResponse"

export interface GetPrimaryMarketBondsPort {
  getPrimaryMarketBonds(
    marketContractId: string,
    queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<PrimaryMarketBondResponse>>
}
