// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelClearingTransactionRequest } from "./model/CancelClearingTransactionRequest"
import { Body, Param, Delete } from "@nestjs/common"
import { CancelClearingTransactionPort } from "./CancelClearingTransactionPort"
import { CancelClearingTransactionAppServiceRequest } from "@app/bond/transaction/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"
import { CancelClearingTransactionAppService } from "@app/bond/transaction/cancelclearingtransaction/service/CancelClearingTransactionAppService"

@RestController("bonds")
export class CancelClearingTransactionHttpAdapter implements CancelClearingTransactionPort {
  constructor(
    private readonly cancelClearingTransactionAppService: CancelClearingTransactionAppService,
  ) {}

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
    )

    return await this.cancelClearingTransactionAppService.execute(appServiceRequest)
  }
}
