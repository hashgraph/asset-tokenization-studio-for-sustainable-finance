// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelClearingTransactionRequest } from "./model/CancelClearingTransactionRequest"
import { Body, Param, Delete } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CancelClearingTransactionPort } from "./CancelClearingTransactionPort"
import { CancelClearingTransactionAppServiceRequest } from "@app/transaction/clearing/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"
import { CancelClearingTransactionAppService } from "@app/transaction/clearing/cancelclearingtransaction/service/CancelClearingTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class CancelClearingTransactionHttpAdapter implements CancelClearingTransactionPort {
  constructor(private readonly cancelClearingTransactionAppService: CancelClearingTransactionAppService) {}

  @ApiOperation({ summary: "Cancel a clearing transaction" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/holders/:holderAccountId/clearings/:clearingId")
  async cancelClearingTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
    @Body() request: CancelClearingTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CancelClearingTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      clearingId,
      request.operationType,
    )

    return await this.cancelClearingTransactionAppService.execute(appServiceRequest)
  }
}
