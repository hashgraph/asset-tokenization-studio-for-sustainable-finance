// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SubmitSubscriptionTransactionRequest } from "./model/SubmitSubscriptionTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { SubmitSubscriptionTransactionPort } from "./SubmitSubscriptionTransactionPort"
import { SubmitSubscriptionTransactionAppServiceRequest } from "@app/transaction/submitsubscription/service/model/SubmitSubscriptionTransactionAppServiceRequest"
import { SubmitSubscriptionTransactionAppService } from "@app/transaction/submitsubscription/service/SubmitSubscriptionTransactionAppService"

@RestController("primary-markets")
export class SubmitSubscriptionTransactionHttpAdapter implements SubmitSubscriptionTransactionPort {
  constructor(private readonly createSubscriptionTransactionAppService: SubmitSubscriptionTransactionAppService) {}

  @Post(":marketContractId/offerings/:offeringDltId/subscriptions")
  async submitSubscriptionTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringDltId") offeringDltId: string,
    @Body() request: SubmitSubscriptionTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new SubmitSubscriptionTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringDltId,
      request.lotUnits,
    )
    return await this.createSubscriptionTransactionAppService.execute(appServiceRequest)
  }
}
