// SPDX-License-Identifier: Apache-2.0
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { BondHoldersResponse } from "./model/BondHoldersResponse"

export interface GetBondHoldersPort {
  getBondHolders(
    bondContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<BondHoldersResponse>>
}
