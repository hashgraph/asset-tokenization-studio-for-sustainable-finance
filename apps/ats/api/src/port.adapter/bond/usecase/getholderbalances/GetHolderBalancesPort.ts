// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { HolderBalancesResponse } from "./model/HolderBalancesResponse"

export interface GetHolderBalancesPort {
  getHolderBalances(
    bondContractId: string,
    holderAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<HolderBalancesResponse>>
}
