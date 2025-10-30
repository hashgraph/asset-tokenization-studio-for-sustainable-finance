// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { DistributionHolderResponse } from "./model/DistributionHolderResponse"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"

export interface GetDistributionHoldersPort {
  getDistributionHolders(
    treasuryContractId: string,
    distributionId: number,
    request: QueryPageRequest & { status?: DistributionHolderStatus },
  ): Promise<PageResponse<DistributionHolderResponse>>
}
