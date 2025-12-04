// SPDX-License-Identifier: Apache-2.0
import { Inject, PageResponse, RestController, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetClearingsTransferPort } from "./GetClearingsTransferPort"
import { GetClearingsTransferQuery } from "@app/bond/getclearingstransfer/query/GetClearingsTransferQuery"
import { ClearingTransferResponse } from "@port/bond/usecase/getclearingstransfer/model/ClearingTransferResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetClearingsTransferHttpAdapter implements GetClearingsTransferPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get clearing transfers for a holder" })
  @ApiResponse({ status: 200, type: ClearingTransferResponse, isArray: true })
  @Get(":bondContractId/holders/:holderAccountId/clearings/transfer")
  async getClearingsTransfer(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ClearingTransferResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetClearingsTransferQuery(bondContractId, holderAccountId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
