// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingBySubscriptionIdTransactionRequest } from "./model/ExecuteOfferingBySubscriptionIdTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ExecuteOfferingBySubscriptionIdTransactionPort } from "./ExecuteOfferingBySubscriptionIdTransactionPort"
import { ExecuteOfferingBySubscriptionIdTransactionAppService } from "@app/transaction/executeofferingbysubscriptionid/service/ExecuteOfferingBySubscriptionIdTransactionAppService"
import { ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest } from "@app/transaction/executeofferingbysubscriptionid/service/model/ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class ExecuteOfferingBySubscriptionIdTransactionHttpAdapter
  implements ExecuteOfferingBySubscriptionIdTransactionPort
{
  constructor(
    private readonly executeOfferingBySubscriptionIdTransactionAppService: ExecuteOfferingBySubscriptionIdTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Executes an offering by specific subscription IDs" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":marketContractId/offerings/:offeringId/subscription-executes")
  async executeOfferingBySubscriptionIdTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
    @Body() request: ExecuteOfferingBySubscriptionIdTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringId,
      request.subscriptionIds,
    )
    return await this.executeOfferingBySubscriptionIdTransactionAppService.execute(appServiceRequest)
  }
}
