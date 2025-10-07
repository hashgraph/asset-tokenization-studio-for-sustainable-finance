import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export interface EnvironmentalAssetRepository {
  save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset>
}
