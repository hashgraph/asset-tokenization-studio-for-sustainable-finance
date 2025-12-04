// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { UpdateClearingStatusTransactionRequest } from "./model/UpdateClearingStatusTransactionRequest"
import { Body, Param, Patch } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { UpdateClearingStatusTransactionPort } from "./UpdateClearingStatusTransactionPort"
import { UpdateClearingHoldTransactionAppService } from "@app/bond/transaction/updateclearingholdtransaction/service/UpdateClearingHoldTransactionAppService"
import { UpdateClearingTransactionAppServiceRequest } from "@app/bond/transaction/updateclearingholdtransaction/service/model/UpdateClearingTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class UpdateClearingStatusTransactionHttpAdapter implements UpdateClearingStatusTransactionPort {
  constructor(private readonly updateClearingTransactionAppService: UpdateClearingHoldTransactionAppService) {}

  @ApiOperation({ summary: "Update clearing transaction status" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Patch(":bondContractId/holders/:holderAccountId/clearings/:clearingId/hold")
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
      request.operationType,
      request.action,
    )

    return await this.updateClearingTransactionAppService.execute(appServiceRequest)
  }
}
