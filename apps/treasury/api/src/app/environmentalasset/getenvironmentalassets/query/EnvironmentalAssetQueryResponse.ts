// SPDX-License-Identifier: Apache-2.0

import { QueryPageResponse, QueryPageable } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { EnvironmentalAssetQueryDTO } from "./EnvironmentalAssetQueryDTO"

export class EnvironmentalAssetQueryResponse extends QueryPageResponse<EnvironmentalAssetQueryDTO> {
  static fromDomainPage(page: QueryPageable<EnvironmentalAsset>): EnvironmentalAssetQueryResponse {
    const transform = (asset: EnvironmentalAsset) => EnvironmentalAssetQueryDTO.fromDomain(asset)
    return QueryPageResponse.fromPage(page, transform) as EnvironmentalAssetQueryResponse
  }
}
