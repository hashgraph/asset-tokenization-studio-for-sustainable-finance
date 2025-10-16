// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { EnvironmentalAssetTokenAlreadyExistsError } from "@domain/environmentalasset/errors/EnvironmentalAssetTokenAlreadyExistsError"

@Singleton()
export class CheckEnvironmentalAssetTokenNotExistsDomainService {
  constructor(
    @Inject("EnvironmentalAssetTokenRepository") private readonly repository: EnvironmentalAssetTokenRepository,
  ) {}

  async execute(environmentalAssetId: string, tokenId: number): Promise<void> {
    const token = await this.repository.findByEnvironmentalAssetIdAndTokenId(environmentalAssetId, tokenId)
    if (token) {
      throw EnvironmentalAssetTokenAlreadyExistsError.create(environmentalAssetId, tokenId)
    }
  }
}
