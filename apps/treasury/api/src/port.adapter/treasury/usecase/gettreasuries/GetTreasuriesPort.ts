// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { TreasuryResponse } from "@port/treasury/usecase/gettreasuries/model/TreasuryResponse"

export interface GetTreasuriesPort {
  getTreasuries(pageOptionsRequest: PageOptionsRequest): Promise<PageResponse<TreasuryResponse>>
}
