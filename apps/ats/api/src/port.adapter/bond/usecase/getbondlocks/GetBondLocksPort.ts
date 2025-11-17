// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { BondLocksResponse } from "./model/BondLocksResponse"

export interface GetBondLocksPort {
  getBondLocks(
    bondContractId: string,
    holderAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondLocksResponse>>
}
