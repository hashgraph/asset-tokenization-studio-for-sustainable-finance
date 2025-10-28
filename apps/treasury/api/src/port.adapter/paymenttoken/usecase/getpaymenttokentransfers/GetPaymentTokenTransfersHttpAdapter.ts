// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetPaymentTokenTransfersQuery } from "@app/paymenttoken/getpaymenttokentransfers/query/GetPaymentTokenTransfersQuery"
import { PaymentTokenTransferResponse } from "./model/PaymentTokenTransferResponse"
import { GetPaymentTokenTransfersPort } from "./GetPaymentTokenTransfersPort"

@RestController("treasuries")
export class GetPaymentTokenTransfersHttpAdapter implements GetPaymentTokenTransfersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/payment-tokens/:paymentTokenContractId/transfers")
  async getPaymentTokenTransfers(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("paymentTokenContractId") paymentTokenContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
    @Query("type") type?: string,
  ): Promise<PageResponse<PaymentTokenTransferResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()

    const query = new GetPaymentTokenTransfersQuery(treasuryContractId, paymentTokenContractId, type, queryPageOptions)

    return await this.queryBus.execute(query)
  }
}
