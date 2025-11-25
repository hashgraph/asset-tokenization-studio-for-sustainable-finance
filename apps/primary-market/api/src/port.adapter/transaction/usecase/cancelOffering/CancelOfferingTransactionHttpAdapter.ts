// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingTransactionRequest } from "./model/CancelOfferingTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { CancelOfferingTransactionPort } from "./CancelOfferingTransactionPort"
import { CancelOfferingTransactionAppService } from "@app/transaction/canceloffering/service/CancelOfferingTransactionAppService"
import { CancelOfferingTransactionAppServiceRequest } from "@app/transaction/canceloffering/service/model/CancelOfferingTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class CancelOfferingTransactionHttpAdapter implements CancelOfferingTransactionPort {
  constructor(private readonly cancelOfferingTransactionAppService: CancelOfferingTransactionAppService) {}

  @ApiOperation({ summary: "Cancels an offering" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":marketContractId/offerings/:offeringId")
  async cancelOfferingTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
    @Body() request: CancelOfferingTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CancelOfferingTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringId,
      request.start,
      request.end,
    )
    return await this.cancelOfferingTransactionAppService.execute(appServiceRequest)
  }
}
