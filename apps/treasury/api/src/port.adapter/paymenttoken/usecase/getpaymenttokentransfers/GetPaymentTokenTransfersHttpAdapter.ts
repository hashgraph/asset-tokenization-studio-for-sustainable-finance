// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { QueryBus } from "@nestjs/cqrs"
import { GetPaymentTokenTransfersQuery } from "@app/paymentToken/getpaymenttokentransfers/query/GetPaymentTokenTransfersQuery"
import { PaymentTokenTransferResponse } from "./model/PaymentTokenTransferResponse"
import { GetPaymentTokenTransfersPort } from "./GetPaymentTokenTransfersPort"

@RestController()
export class GetPaymentTokenTransfersHttpAdapter implements GetPaymentTokenTransfersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/payment-tokens/:paymentTokenId/transfers")
  async getPaymentTokenTransfers(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("paymentTokenId") paymentTokenId: string,
    @Query() queryPageRequest: QueryPageRequest,
    @Query("type") type?: string,
  ): Promise<PageResponse<PaymentTokenTransferResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()

    const query = new GetPaymentTokenTransfersQuery(treasuryContractId, paymentTokenId, type, queryPageOptions)

    return (await this.queryBus.execute(query)) as PageResponse<PaymentTokenTransferResponse>
  }
}
