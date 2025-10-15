import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenAlreadyExistsError extends DomainError {
  static forEnvironmentalAssetAndSerial(
    environmentalAssetId: string,
    serialNumber: string,
  ): EnvironmentalAssetTokenAlreadyExistsError {
    return new EnvironmentalAssetTokenAlreadyExistsError(
      `EnvironmentalAssetToken already exists for environmentalAssetId: ${environmentalAssetId} ` +
        `and serialNumber: ${serialNumber}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
