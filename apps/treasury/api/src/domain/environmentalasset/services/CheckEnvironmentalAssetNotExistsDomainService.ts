// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetAlreadyExistsError } from "@domain/environmentalasset/errors/EnvironmentalAssetAlreadyExistsError"

@Singleton()
export class CheckEnvironmentalAssetNotExistsDomainService {
  constructor(@Inject("EnvironmentalAssetRepository") private readonly repository: EnvironmentalAssetRepository) {}

  async execute(contractId: string): Promise<void> {
    const environmentalAsset = await this.repository.findByContractId(contractId)
    if (environmentalAsset) {
      throw EnvironmentalAssetAlreadyExistsError.idError(contractId)
    }
  }
}
