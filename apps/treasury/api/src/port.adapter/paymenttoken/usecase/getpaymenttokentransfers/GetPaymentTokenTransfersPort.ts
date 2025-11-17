import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { PaymentTokenTransferResponse } from "./model/PaymentTokenTransferResponse"

export interface GetPaymentTokenTransfersPort {
  getPaymentTokenTransfers(
    treasuryContractId: string,
    paymentTokenContractId: string,
    pageOptionsRequest: PageOptionsRequest,
    type?: string,
  ): Promise<PageResponse<PaymentTokenTransferResponse>>
}
