// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenNotFoundError extends DomainError {
  private constructor(message: string) {
    super(message)
  }

  static create(environmentalAssetContractId: string, tokenId: number): EnvironmentalAssetTokenNotFoundError {
    return new EnvironmentalAssetTokenNotFoundError(
      `Environmental asset token with contractId ${environmentalAssetContractId} and tokenId ${tokenId} not found`,
    )
  }
}
