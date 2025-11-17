import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetTransferResponse } from "./model/EnvironmentalAssetTransferResponse"

export interface GetEnvironmentalAssetTransfersPort {
  getEnvironmentalAssetTransfers(
    treasuryContractId: string,
    environmentalAssetContractId: string,
    pageOptionsRequest: PageOptionsRequest,
    type?: string,
  ): Promise<PageResponse<EnvironmentalAssetTransferResponse>>
}
