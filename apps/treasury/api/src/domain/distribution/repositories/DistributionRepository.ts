// SPDX-License-Identifier: Apache-2.0

import { Distribution } from "@domain/distribution/model/Distribution"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface DistributionRepository {
  save(distribution: Distribution): Promise<Distribution>
  findByTreasuryId(treasuryId: string, pageOptions: PageOptions): Promise<Page<Distribution>>
}
