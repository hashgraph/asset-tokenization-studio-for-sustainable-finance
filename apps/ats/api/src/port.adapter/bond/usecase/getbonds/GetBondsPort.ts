// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { BondResponse } from "./model/BondResponse"

export interface GetBondsPort {
  getBonds(queryPageRequest: QueryPageRequest): Promise<PageResponse<BondResponse>>
}
