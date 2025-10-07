import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export interface EnvironmentalAssetRepository {
  save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset>
  findById(id: string): Promise<EnvironmentalAsset | null>
  softDelete(id: string): Promise<EnvironmentalAsset>
}
