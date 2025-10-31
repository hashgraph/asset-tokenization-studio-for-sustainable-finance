// SPDX-License-Identifier: Apache-2.0

import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface DistributionHolderRepository {
  save(distributionHolder: DistributionHolder): Promise<DistributionHolder>
  findByDistributionId(
    distributionId: number,
    pageOptions: PageOptions,
    status?: string,
  ): Promise<Page<DistributionHolder>>
}
