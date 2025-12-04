// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReleaseHoldRequest } from "./model/ReleaseHoldRequest"
import { Body, Delete, Param, ParseIntPipe } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { ReleaseHoldPort } from "./ReleaseHoldPort"
import { ReleaseHoldAppService } from "@app/bond/transaction/releaseholdtransaction/service/ReleaseHoldAppService"
import { ReleaseHoldAppServiceRequest } from "@app/bond/transaction/releaseholdtransaction/service/model/ReleaseHoldAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class ReleaseHoldHttpAdapter implements ReleaseHoldPort {
  constructor(private readonly releaseHoldAppService: ReleaseHoldAppService) {}

  @ApiOperation({ summary: "Release a bond hold" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/holders/:holderAccountId/holds/:holdId")
  async releaseHold(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("holdId", ParseIntPipe) holdId: number,
    @Body() request: ReleaseHoldRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ReleaseHoldAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      holdId,
      request.amount,
    )

    return await this.releaseHoldAppService.execute(appServiceRequest)
  }
}
