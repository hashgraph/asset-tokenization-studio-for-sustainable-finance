import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenNotFoundError extends EntityNotFoundError {
  static forEnvironmentalAssetAndSerial(
    environmentalAssetId: string,
    serialNumber: string,
  ): EnvironmentalAssetTokenNotFoundError {
    return new EnvironmentalAssetTokenNotFoundError(
      `EnvironmentalAssetToken not found for environmentalAssetId: ${environmentalAssetId} ` +
        `and serialNumber: ${serialNumber}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
