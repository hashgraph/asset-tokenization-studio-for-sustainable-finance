// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import {
  PageOptionsRequest,
  RestController,
  Inject,
  PageResponse,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetPaymentTokensQuery } from "@app/paymenttoken/getpaymenttokens/query/GetPaymentTokensQuery"
import { PaymentTokenResponse } from "./model/PaymentTokenResponse"
import { GetPaymentTokensPort } from "./GetPaymentTokensPort"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetPaymentTokensHttpAdapter implements GetPaymentTokensPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: "Returns the list of all the payment tokens the treasury has had with their addition or removal date)",
  })
  @ApiPaginatedResponse(PaymentTokenResponse)
  @Get(":treasuryId/payment-tokens")
  async getPaymentTokens(
    @Param("treasuryId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<PaymentTokenResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetPaymentTokensQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
