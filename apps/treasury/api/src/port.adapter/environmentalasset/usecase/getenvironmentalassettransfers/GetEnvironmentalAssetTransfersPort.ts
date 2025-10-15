import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"

export interface GetEnvironmentalAssetTransfersPort {
  getEnvironmentalAssetTransfers(
    environmentalAssetContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetTransferResponse>>
}
