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
import { GetPaymentTokenTransfersQuery } from "@app/paymenttoken/getpaymenttokentransfers/query/GetPaymentTokenTransfersQuery"
import { PaymentTokenTransferResponse } from "./model/PaymentTokenTransferResponse"
import { GetPaymentTokenTransfersPort } from "./GetPaymentTokenTransfersPort"
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetPaymentTokenTransfersHttpAdapter implements GetPaymentTokenTransfersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: "Returns info about inflows and outflows transfer that have been executed for a specific payment token",
  })
  @ApiPaginatedResponse(PaymentTokenTransferResponse)
  @ApiQuery({ name: "type", enum: ["INFLOW", "OUTFLOW"], required: false })
  @Get(":treasuryId/payment-tokens/:tokenId/transfers")
  async getPaymentTokenTransfers(
    @Param("treasuryId") treasuryContractId: string,
    @Param("tokenId") paymentTokenContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
    @Query("type") type?: string,
  ): Promise<PageResponse<PaymentTokenTransferResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()

    const query = new GetPaymentTokenTransfersQuery(treasuryContractId, paymentTokenContractId, type, queryPageOptions)

    return await this.queryBus.execute(query)
  }
}
