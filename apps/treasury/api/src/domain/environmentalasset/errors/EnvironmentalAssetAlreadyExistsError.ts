import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetAlreadyExistsError extends DomainError {
  static idError(id: string): EnvironmentalAssetAlreadyExistsError {
    return new EnvironmentalAssetAlreadyExistsError(`EnvironmentalAsset already exists for id: ${id}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}