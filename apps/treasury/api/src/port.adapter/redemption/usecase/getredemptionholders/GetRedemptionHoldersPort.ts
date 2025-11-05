// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { RedemptionHolderResponse } from "./model/RedemptionHolderResponse"

export interface GetRedemptionHoldersPort {
  getRedemptionHolders(
    treasuryContractId: string,
    queryPageRequest: QueryPageRequest,
    status?: string,
  ): Promise<PageResponse<RedemptionHolderResponse>>
}
