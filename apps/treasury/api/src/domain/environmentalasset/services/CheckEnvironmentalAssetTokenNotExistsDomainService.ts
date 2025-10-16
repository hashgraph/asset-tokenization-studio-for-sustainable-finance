// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { EnvironmentalAssetTokenAlreadyExistsError } from "@domain/environmentalasset/errors/EnvironmentalAssetTokenAlreadyExistsError"

@Singleton()
export class CheckEnvironmentalAssetTokenNotExistsDomainService {
  constructor(@Inject() private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository) {}

  async execute(environmentalAssetId: string, tokenId: number): Promise<void> {
    const token = await this.environmentalAssetTokenRepository.findByEnvironmentalAssetIdAndTokenId(
      environmentalAssetId,
      tokenId,
    )
    if (token) {
      throw EnvironmentalAssetTokenAlreadyExistsError.create(environmentalAssetId, tokenId)
    }
  }
}
