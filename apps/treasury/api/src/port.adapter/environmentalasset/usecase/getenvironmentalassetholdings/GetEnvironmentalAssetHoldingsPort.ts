// SPDX-License-Identifier: Apache-2.0

import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetHoldingsResponse } from "./model/EnvironmentalAssetHoldingsResponse"

export interface GetEnvironmentalAssetHoldingsPort {
  getEnvironmentalAssetHoldings(
    treasuryContractId: string,
    assetContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetHoldingsResponse>>
}
