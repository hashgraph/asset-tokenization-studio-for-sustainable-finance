// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetToken } from "@domain/environmentalasset/model/EnvironmentalAssetToken"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetTokenExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetTokenExistsDomainService"

@Singleton()
export class RemoveEnvironmentalAssetTokenDomainService {
  constructor(
    @Inject()
    private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkEnvironmentalAssetTokenExists: CheckEnvironmentalAssetTokenExistsDomainService,
  ) {}

  async execute(environmentalAssetContractId: string, tokenId: number): Promise<EnvironmentalAssetToken> {
    const environmentalAsset =
      await this.checkEnvironmentalAssetExists.executeByContractId(environmentalAssetContractId)

    let existingEnvironmentalAssetToken = await this.checkEnvironmentalAssetTokenExists.execute(
      environmentalAsset.id,
      tokenId,
    )

    existingEnvironmentalAssetToken.removalDate = new Date()


    return await this.environmentalAssetTokenRepository.save(existingEnvironmentalAssetToken)
  }
}
