// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockTransactionRequest } from "./model/ReleaseBondLockTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { ReleaseBondLockTransactionPort } from "./ReleaseBondLockTransactionPort"
import { ReleaseBondLockTransactionAppServiceRequest } from "@app/bond/transaction/releasebondlocktransaction/service/model/ReleaseBondLockTransactionAppServiceRequest"
import { ReleaseBondLockTransactionAppService } from "@app/bond/transaction/releasebondlocktransaction/service/ReleaseBondLockTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class ReleaseBondLockTransactionHttpAdapter implements ReleaseBondLockTransactionPort {
  constructor(private readonly releaseBondLockTransactionAppService: ReleaseBondLockTransactionAppService) {}

  @ApiOperation({ summary: "Release a bond lock" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/holders/:holderAccountId/locks")
  async releaseBondLockTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: ReleaseBondLockTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ReleaseBondLockTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.lockId,
      request.partition,
    )

    return await this.releaseBondLockTransactionAppService.execute(appServiceRequest)
  }
}
