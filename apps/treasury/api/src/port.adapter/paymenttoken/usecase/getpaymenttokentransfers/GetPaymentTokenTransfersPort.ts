import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { PaymentTokenTransferResponse } from "./model/PaymentTokenTransferResponse"

export interface GetPaymentTokenTransfersPort {
  getPaymentTokenTransfers(
    paymentTokenId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<PaymentTokenTransferResponse>>
}
