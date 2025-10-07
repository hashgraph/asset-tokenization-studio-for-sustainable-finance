import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { Treasury } from "@domain/treasury/model/Treasury"

export class RemoveEnvironmentalAssetServiceResponse {
  readonly environmentalAsset: EnvironmentalAsset
  readonly treasury: Treasury

  constructor(environmentalAsset: EnvironmentalAsset, treasury: Treasury) {
    this.environmentalAsset = environmentalAsset
    this.treasury = treasury
  }
}