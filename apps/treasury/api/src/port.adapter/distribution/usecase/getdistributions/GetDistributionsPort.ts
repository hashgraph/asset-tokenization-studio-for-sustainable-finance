// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { DistributionResponse } from "./model/DistributionResponse"

export interface GetDistributionsPort {
  getDistributions(
    treasuryContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<DistributionResponse>>
}
