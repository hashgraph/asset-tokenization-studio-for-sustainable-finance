// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarketResponse } from "@port/primarymarket/shared/model/PrimaryMarketResponse"

export interface GetPrimaryMarketsPort {
  getPrimaryMarkets(queryPageRequest: QueryPageRequest): Promise<PageResponse<PrimaryMarketResponse>>
}
