// SPDX-License-Identifier: Apache-2.0
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { BondLocksResponse } from "./model/BondLocksResponse"

export interface GetBondLocksPort {
  getBondLocks(
    bondContractId: string,
    holderAccountId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<BondLocksResponse>>
}
