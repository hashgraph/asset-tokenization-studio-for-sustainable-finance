// SPDX-License-Identifier: Apache-2.0

import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { PaymentTokenResponse } from "./model/PaymentTokenResponse"

export interface GetPaymentTokensPort {
  getPaymentTokens(
    treasuryContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<PaymentTokenResponse>>
}
