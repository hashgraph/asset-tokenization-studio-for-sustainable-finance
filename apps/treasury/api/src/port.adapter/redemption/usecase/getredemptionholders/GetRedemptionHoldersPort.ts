// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { RedemptionHolderResponse } from "./model/RedemptionHolderResponse"

export interface GetRedemptionHoldersPort {
  getRedemptionHolders(
    treasuryContractId: string,
    pageOptionsRequest: PageOptionsRequest,
    status?: string,
  ): Promise<PageResponse<RedemptionHolderResponse>>
}
