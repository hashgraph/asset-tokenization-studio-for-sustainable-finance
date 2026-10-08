// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { Distribution } from "@domain/distribution/model/Distribution"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { DistributionNotFoundError } from "@domain/distribution/errors/DistributionNotFoundError"

@Singleton()
export class CheckDistributionExistsDomainService {
  constructor(@Inject() private readonly distributionRepository: DistributionRepository) {}

  async execute(id: number): Promise<Distribution> {
    const distribution = await this.distributionRepository.findById(id)
    if (!distribution) {
      throw DistributionNotFoundError.idError(id)
    }
    return distribution
  }
}
