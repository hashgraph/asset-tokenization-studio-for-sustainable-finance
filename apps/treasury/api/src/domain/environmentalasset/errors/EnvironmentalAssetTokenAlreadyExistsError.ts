// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenAlreadyExistsError extends DomainError {
  private constructor(message: string) {
    super(message)
  }

  static create(environmentalAssetId: string, tokenId: number): EnvironmentalAssetTokenAlreadyExistsError {
    return new EnvironmentalAssetTokenAlreadyExistsError(
      `Environmental asset token with environmentalAssetId ${environmentalAssetId}` +
        ` and tokenId ${tokenId} already exists`,
    )
  }
}
