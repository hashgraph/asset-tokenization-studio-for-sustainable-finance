import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"

export interface GetEnvironmentalAssetTransfersPort {
  getEnvironmentalAssetTransfers(
    treasuryContractId: string,
    environmentalAssetContractId: string,
    queryPageRequest: QueryPageRequest,
    type?: string,
  ): Promise<PageResponse<EnvironmentalAssetTransferResponse>>
}
