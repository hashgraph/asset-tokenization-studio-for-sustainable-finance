// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UpdateClearingStatusTransactionRequest } from "./model/UpdateClearingStatusTransactionRequest"
import { Body, Param, Patch } from "@nestjs/common"
import { UpdateClearingStatusTransactionPort } from "./UpdateClearingStatusTransactionPort"
import { UpdateClearingTransactionAppService } from "@app/bond/transaction/updateclearingtransaction/service/UpdateClearingTransactionAppService"
import { UpdateClearingTransactionAppServiceRequest } from "@app/bond/transaction/updateclearingtransaction/service/model/UpdateClearingTransactionAppServiceRequest"

@RestController("bonds")
export class UpdateClearingStatusTransactionHttpAdapter implements UpdateClearingStatusTransactionPort {
  constructor(
    private readonly updateClearingTransactionAppService: UpdateClearingTransactionAppService,
  ) {}

  @Patch(":bondContractId/holders/:holderAccountId/clearings/:clearingId")
  async updateClearingStatusTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
    @Body() request: UpdateClearingStatusTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new UpdateClearingTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      clearingId,
      request.action,
    )

    return await this.updateClearingTransactionAppService.execute(appServiceRequest)
  }
}
