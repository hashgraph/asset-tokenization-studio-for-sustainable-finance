// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeemQueryResponse } from "@app/bond/getclearingsredeem/query/ClearingRedeemQueryResponse"

export interface GetClearingsRedeemPort {
  getClearingsRedeem(
    bondContractId: string,
    holderAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ClearingRedeemQueryResponse>>
}
