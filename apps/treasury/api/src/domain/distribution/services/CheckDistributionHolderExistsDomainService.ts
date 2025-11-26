// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { DistributionHolderRepository } from "@domain/distribution/repositories/DistributionHolderRepository"
import { DistributionHolderNotFoundError } from "@domain/distribution/errors/DistributionHolderNotFoundError"
import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"

@Singleton()
export class CheckDistributionHolderExistsDomainService {
  constructor(@Inject() private readonly distributionHolderRepository: DistributionHolderRepository) {}

  async execute(distributionId: number, holderAccountId: string): Promise<DistributionHolder> {
    const distributionHolder = await this.distributionHolderRepository.findOneByDistributionIdAndHolderAccountId(
      distributionId,
      holderAccountId,
    )
    if (!distributionHolder) {
      throw DistributionHolderNotFoundError.distributionIdAndHolderAccountIdError(distributionId, holderAccountId)
    }
    return distributionHolder
  }
}
