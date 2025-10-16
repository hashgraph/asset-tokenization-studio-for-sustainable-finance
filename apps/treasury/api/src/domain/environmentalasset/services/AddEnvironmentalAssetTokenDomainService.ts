// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { EnvironmentalAssetToken } from "@domain/environmentalasset/model/EnvironmentalAssetToken"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetTokenNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetTokenNotExistsDomainService"

@Singleton()
export class AddEnvironmentalAssetTokenDomainService {
  constructor(
    @Inject()
    private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkEnvironmentalAssetTokenNotExists: CheckEnvironmentalAssetTokenNotExistsDomainService,
  ) {}

  async execute(environmentalAssetContractId: string, tokenId: number): Promise<EnvironmentalAssetToken> {
    const environmentalAsset =
      await this.checkEnvironmentalAssetExists.executeByContractId(environmentalAssetContractId)

    await this.checkEnvironmentalAssetTokenNotExists.execute(environmentalAsset.id, tokenId)

    const token = new EnvironmentalAssetToken()
    token.environmentalAssetId = environmentalAsset.id
    token.tokenId = tokenId

    return await this.environmentalAssetTokenRepository.save(token)
  }
}
