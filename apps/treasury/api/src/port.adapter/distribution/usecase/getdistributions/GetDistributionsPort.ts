// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { DistributionResponse } from "./model/DistributionResponse"

export interface GetDistributionsPort {
  getDistributions(
    treasuryContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<DistributionResponse>>
}
