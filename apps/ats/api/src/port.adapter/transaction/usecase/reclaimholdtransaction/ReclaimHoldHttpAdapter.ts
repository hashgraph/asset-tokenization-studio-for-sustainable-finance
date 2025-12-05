// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReclaimHoldRequest } from "./model/ReclaimHoldRequest"
import { Body, Delete, Param, ParseIntPipe } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { ReclaimHoldPort } from "./ReclaimHoldPort"
import { ReclaimHoldAppService } from "@app/transaction/hold/reclaimholdtransaction/service/ReclaimHoldAppService"
import { ReclaimHoldAppServiceRequest } from "@app/transaction/hold/reclaimholdtransaction/service/model/ReclaimHoldAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class ReclaimHoldHttpAdapter implements ReclaimHoldPort {
  constructor(private readonly reclaimHoldAppService: ReclaimHoldAppService) {}

  @ApiOperation({ summary: "Reclaim a bond hold" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/holders/:holderAccountId/holds/:holdId/reclaim")
  async reclaimHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("holdId", ParseIntPipe) holdId: number,
    @Body() request: ReclaimHoldRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ReclaimHoldAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      holdId,
    )

    return await this.reclaimHoldAppService.execute(appServiceRequest)
  }
}
