import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetNotFoundError extends EntityNotFoundError {
  static idError(id: string): EnvironmentalAssetNotFoundError {
    return new EnvironmentalAssetNotFoundError(`EnvironmentalAsset not found for id: ${id}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
