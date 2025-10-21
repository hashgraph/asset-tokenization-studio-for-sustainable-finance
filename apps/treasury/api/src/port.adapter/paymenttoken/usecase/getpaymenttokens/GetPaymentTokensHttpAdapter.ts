// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { QueryPageRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { QueryBus } from "@nestjs/cqrs"
import { GetPaymentTokensQuery } from "@app/paymenttoken/getpaymenttokens/query/GetPaymentTokensQuery"
import { PaymentTokenResponse } from "./model/PaymentTokenResponse"
import { GetPaymentTokensPort } from "./GetPaymentTokensPort"

@RestController("treasuries")
export class GetPaymentTokensHttpAdapter implements GetPaymentTokensPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/payment-tokens")
  async getPaymentTokens(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<PaymentTokenResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetPaymentTokensQuery(treasuryContractId, queryPageOptions)
    return (await this.queryBus.execute(query)) as PageResponse<PaymentTokenResponse>
  }
}
