// SPDX-License-Identifier: Apache-2.0

import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"

export interface DistributionHolderRepository {
  save(distributionHolder: DistributionHolder): Promise<DistributionHolder>
}
