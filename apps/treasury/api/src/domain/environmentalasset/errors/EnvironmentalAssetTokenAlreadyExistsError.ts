import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenAlreadyExistsError extends DomainError {
  constructor(environmentalAssetId: string, tokenId: number) {
    super(
      `Environmental Asset Token already exists with environmentalAssetId: ${environmentalAssetId} ` +
        `and tokenId: ${tokenId}.`,
    )
  }
}
