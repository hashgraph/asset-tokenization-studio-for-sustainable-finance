// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelSubscriptionTransactionRequest } from "./model/CancelSubscriptionTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { CancelSubscriptionTransactionPort } from "./CancelSubscriptionTransactionPort"
import { CancelSubscriptionTransactionAppService } from "@app/transaction/cancelsubscription/service/CancelSubscriptionTransactionAppService"
import { CancelSubscriptionTransactionAppServiceRequest } from "@app/transaction/cancelsubscription/service/model/CancelSubscriptionTransactionAppServiceRequest"

@RestController("primary-markets")
export class CancelSubscriptionTransactionHttpAdapter implements CancelSubscriptionTransactionPort {
  constructor(private readonly cancelSubscriptionTransactionAppService: CancelSubscriptionTransactionAppService) {}

  @Delete(":marketContractId/offerings/:offeringDltId/subscriptions")
  async cancelSubscriptionTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringDltId") offeringDltId: string,
    @Body() request: CancelSubscriptionTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CancelSubscriptionTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringDltId,
      request.subscriptionDltId,
    )
    return await this.cancelSubscriptionTransactionAppService.execute(appServiceRequest)
  }
}
