import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenAlreadyExistsError extends DomainError {
  static tokenError(environmentalAssetId: string, serialNumber: number): EnvironmentalAssetTokenAlreadyExistsError {
    return new EnvironmentalAssetTokenAlreadyExistsError(
      `Environmental Asset Token already exists with environmentalAssetId: ${environmentalAssetId} ` +
        `and serialNumber: ${serialNumber}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
