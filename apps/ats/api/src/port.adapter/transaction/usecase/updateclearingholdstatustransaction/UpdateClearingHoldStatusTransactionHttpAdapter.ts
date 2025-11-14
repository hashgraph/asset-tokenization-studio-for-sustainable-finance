// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UpdateClearingHoldStatusTransactionRequest } from "./model/UpdateClearingHoldStatusTransactionRequest"
import { Body, Param, Patch } from "@nestjs/common"
import { UpdateClearingHoldStatusTransactionPort } from "./UpdateClearingHoldStatusTransactionPort"
import { UpdateClearingHoldTransactionAppService } from "@app/bond/transaction/updateclearingholdtransaction/service/UpdateClearingHoldTransactionAppService"
import { UpdateClearingHoldTransactionAppServiceRequest } from "@app/bond/transaction/updateclearingholdtransaction/service/model/UpdateClearingHoldTransactionAppServiceRequest"

@RestController("bonds")
export class UpdateClearingHoldStatusTransactionHttpAdapter implements UpdateClearingHoldStatusTransactionPort {
  constructor(private readonly updateClearingTransactionAppService: UpdateClearingHoldTransactionAppService) {}

  @Patch(":bondContractId/holders/:holderAccountId/clearings/:clearingId/hold")
  async updateClearingStatusTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("clearingId") clearingId: number,
    @Body() request: UpdateClearingHoldStatusTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new UpdateClearingHoldTransactionAppServiceRequest(
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
