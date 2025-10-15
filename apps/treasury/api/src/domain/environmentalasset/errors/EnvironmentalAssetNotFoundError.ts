import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetNotFoundError extends EntityNotFoundError {
  static idError(id: string): EnvironmentalAssetNotFoundError {
    return new EnvironmentalAssetNotFoundError(`EnvironmentalAsset not found for id: ${id}.`)
  }

  static contractIdError(contractId: string): EnvironmentalAssetNotFoundError {
    return new EnvironmentalAssetNotFoundError(`EnvironmentalAsset not found for contractId: ${contractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
