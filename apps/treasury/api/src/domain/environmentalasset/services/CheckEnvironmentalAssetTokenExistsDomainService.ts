// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { EnvironmentalAssetToken } from "@domain/environmentalasset/model/EnvironmentalAssetToken"
import { EnvironmentalAssetTokenNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetTokenNotFoundError"

@Singleton()
export class CheckEnvironmentalAssetTokenExistsDomainService {
  constructor(@Inject() private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository) {}

  async execute(environmentalAssetId: string, tokenId: number): Promise<EnvironmentalAssetToken> {
    const environmentalAssetToken = await this.environmentalAssetTokenRepository.findByEnvironmentalAssetIdAndTokenId(
      environmentalAssetId,
      tokenId,
    )
    if (!environmentalAssetToken) {
      throw EnvironmentalAssetTokenNotFoundError.create(environmentalAssetId, tokenId)
    }
    return environmentalAssetToken
  }
}
