// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetHoldingsResponse } from "./model/EnvironmentalAssetHoldingsResponse"

export interface GetEnvironmentalAssetHoldingsPort {
  getEnvironmentalAssetHoldings(
    treasuryContractId: string,
    assetContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<EnvironmentalAssetHoldingsResponse>>
}
