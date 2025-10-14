import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetResponse } from "./model/EnvironmentalAssetResponse"

export interface GetEnvironmentalAssetsPort {
  getEnvironmentalAssets(
    treasuryContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetResponse>>
}
