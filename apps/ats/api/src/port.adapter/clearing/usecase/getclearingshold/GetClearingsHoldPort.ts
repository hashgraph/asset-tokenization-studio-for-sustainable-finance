// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { ClearingHoldQueryResponse } from "@app/clearing/getclearingshold/query/ClearingHoldQueryResponse"

export interface GetClearingsHoldPort {
  getClearingsHold(
    bondContractId: string,
    holderAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ClearingHoldQueryResponse>>
}
