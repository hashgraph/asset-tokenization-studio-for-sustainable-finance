// SPDX-License-Identifier: Apache-2.0

import { Distribution } from "@domain/distribution/model/Distribution"

export interface DistributionRepository {
  save(distribution: Distribution): Promise<Distribution>
}
