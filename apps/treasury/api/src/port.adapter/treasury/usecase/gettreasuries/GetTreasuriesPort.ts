// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { TreasuryResponse } from "@port/treasury/usecase/gettreasuries/model/TreasuryResponse"

export interface GetTreasuriesPort {
  getTreasuries(queryPageRequest: QueryPageRequest): Promise<PageResponse<TreasuryResponse>>
}
