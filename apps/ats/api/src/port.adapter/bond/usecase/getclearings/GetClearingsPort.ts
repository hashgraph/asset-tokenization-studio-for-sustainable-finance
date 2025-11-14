// SPDX-License-Identifier: Apache-2.0
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { ClearingQueryResponse } from "@app/bond/getclearings/query/ClearingHoldQueryResponse"

export interface GetClearingsPort {
  getClearings(
    bondContractId: string,
    holderAccountId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<ClearingQueryResponse>>
}
