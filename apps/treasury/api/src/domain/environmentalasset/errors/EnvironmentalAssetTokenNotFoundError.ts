import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenNotFoundError extends EntityNotFoundError {
  constructor(environmentalAssetId: string, tokenId: number) {
    super(
      `Environmental Asset Token not found with environmentalAssetId: ${environmentalAssetId} and tokenId: ${tokenId}.`,
    )
  }
}
