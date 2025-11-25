// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelSubscriptionTransactionRequest } from "./model/CancelSubscriptionTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { CancelSubscriptionTransactionPort } from "./CancelSubscriptionTransactionPort"
import { CancelSubscriptionTransactionAppService } from "@app/transaction/cancelsubscription/service/CancelSubscriptionTransactionAppService"
import { CancelSubscriptionTransactionAppServiceRequest } from "@app/transaction/cancelsubscription/service/model/CancelSubscriptionTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class CancelSubscriptionTransactionHttpAdapter implements CancelSubscriptionTransactionPort {
  constructor(private readonly cancelSubscriptionTransactionAppService: CancelSubscriptionTransactionAppService) {}

  @ApiOperation({ summary: "Cancels a subscription for an offering" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":marketContractId/offerings/:offeringId/subscriptions")
  async cancelSubscriptionTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
    @Body() request: CancelSubscriptionTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CancelSubscriptionTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringId,
      request.subscriptionId,
    )
    return await this.cancelSubscriptionTransactionAppService.execute(appServiceRequest)
  }
}
