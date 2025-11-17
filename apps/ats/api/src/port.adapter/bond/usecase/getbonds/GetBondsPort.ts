// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { BondResponse } from "./model/BondResponse"

export interface GetBondsPort {
  getBonds(pageOptionsRequest: PageOptionsRequest): Promise<PageResponse<BondResponse>>
}
