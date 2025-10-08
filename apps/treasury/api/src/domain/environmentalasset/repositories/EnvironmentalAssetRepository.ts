import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export interface EnvironmentalAssetRepository {
  save(environmentalAsset: EnvironmentalAsset): Promise<void>
  findByContractId(contractId: string): Promise<EnvironmentalAsset | null>
  softDeleteByContractId(contractId: string): Promise<EnvironmentalAsset>
}
