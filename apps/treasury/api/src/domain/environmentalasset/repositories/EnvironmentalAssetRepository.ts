import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export interface EnvironmentalAssetRepository {
  save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset>
  findByAssetIdAndTreasuryId(assetId: string, treasuryId: string): Promise<EnvironmentalAsset | null>
  softDeleteByAssetIdAndTreasuryId(assetId: string, treasuryId: string): Promise<EnvironmentalAsset>
}
