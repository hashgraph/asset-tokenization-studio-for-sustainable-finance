// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export class EnvironmentalAssetQueryDTO {
  contractId: string
  treasuryId: string
  validityDate?: Date

  static fromDomain(asset: EnvironmentalAsset): EnvironmentalAssetQueryDTO {
    const data = new EnvironmentalAssetQueryDTO()
    data.contractId = asset.contractId
    data.treasuryId = asset.treasuryId
    data.validityDate = asset.validityDate
    return data
  }
}
