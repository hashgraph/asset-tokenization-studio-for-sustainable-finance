// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { BondHoldersResponse } from "./model/BondHoldersResponse"

export interface GetBondHoldersPort {
  getBondHolders(
    bondContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondHoldersResponse>>
}
