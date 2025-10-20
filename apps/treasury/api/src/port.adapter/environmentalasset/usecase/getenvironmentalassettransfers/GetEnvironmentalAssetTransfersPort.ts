import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"

export interface GetEnvironmentalAssetTransfersPort {
  getEnvironmentalAssetTransfers(
    treasuryContractId: string,
    environmentalAssetContractId: string,
    type: string | undefined,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<EnvironmentalAssetTransferResponse>>
}
