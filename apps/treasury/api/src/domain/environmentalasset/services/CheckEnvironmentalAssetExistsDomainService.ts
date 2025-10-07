// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"

@Singleton()
export class CheckEnvironmentalAssetExistsDomainService {
  constructor(@Inject("EnvironmentalAssetRepository") private readonly repository: EnvironmentalAssetRepository) {}

  async execute(id: string): Promise<EnvironmentalAsset> {
    const environmentalAsset = await this.repository.findById(id)
    if (!environmentalAsset) {
      throw EnvironmentalAssetNotFoundError.idError(id)
    }
    return environmentalAsset
  }
}
