// SPDX-License-Identifier: Apache-2.0
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { ClearingHoldQueryResponse } from "@app/bond/getclearingshold/query/ClearingHoldQueryResponse"

export interface GetClearingsHoldPort {
  getClearingsHold(
    bondContractId: string,
    holderAccountId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<ClearingHoldQueryResponse>>
}
