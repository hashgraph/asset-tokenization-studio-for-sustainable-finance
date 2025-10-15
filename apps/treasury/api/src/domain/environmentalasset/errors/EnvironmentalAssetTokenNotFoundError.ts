import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenNotFoundError extends EntityNotFoundError {
  static tokenError(environmentalAssetId: string, serialNumber: number): EnvironmentalAssetTokenNotFoundError {
    return new EnvironmentalAssetTokenNotFoundError(
      `Environmental Asset Token not found with environmentalAssetId: ${environmentalAssetId} ` +
        `and serialNumber: ${serialNumber}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
