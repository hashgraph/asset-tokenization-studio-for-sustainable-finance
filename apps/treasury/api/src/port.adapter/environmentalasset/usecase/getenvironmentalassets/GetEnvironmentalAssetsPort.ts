import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetResponse } from "./model/EnvironmentalAssetResponse"

export interface GetEnvironmentalAssetsPort {
  getEnvironmentalAssets(
    treasuryContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<EnvironmentalAssetResponse>>
}
