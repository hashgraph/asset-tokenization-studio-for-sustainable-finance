// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetAlreadyExistsError } from "@domain/environmentalasset/errors/EnvironmentalAssetAlreadyExistsError"

@Singleton()
export class CheckEnvironmentalAssetNotExistsDomainService {
  constructor(@Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository) {}

  async execute(assetContractId: string, treasuryId: string): Promise<void> {
    const environmentalAsset = await this.environmentalAssetRepository.findByContractIdAndTreasuryId(
      assetContractId,
      treasuryId,
    )
    if (environmentalAsset) {
      throw EnvironmentalAssetAlreadyExistsError.idError(assetContractId)
    }
  }
}
