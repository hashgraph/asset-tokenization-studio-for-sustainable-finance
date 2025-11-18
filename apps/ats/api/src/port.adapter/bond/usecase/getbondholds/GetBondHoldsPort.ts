// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondHoldsResponse } from "./model/BondHoldsResponse"

export interface GetBondHoldsPort {
  getBondHolds(
    bondContractId: string,
    holderAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondHoldsResponse>>
}
