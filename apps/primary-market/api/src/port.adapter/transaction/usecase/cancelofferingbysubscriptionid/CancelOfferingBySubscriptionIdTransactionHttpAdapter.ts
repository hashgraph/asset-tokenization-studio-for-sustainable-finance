// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingBySubscriptionIdTransactionRequest } from "./model/CancelOfferingBySubscriptionIdTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { CancelOfferingBySubscriptionIdTransactionPort } from "./CancelOfferingBySubscriptionIdTransactionPort"
import { CancelOfferingBySubscriptionIdTransactionAppService } from "@app/transaction/cancelofferingbysubscriptionid/service/CancelOfferingBySubscriptionIdTransactionAppService"
import { CancelOfferingBySubscriptionIdTransactionAppServiceRequest } from "@app/transaction/cancelofferingbysubscriptionid/service/model/CancelOfferingBySubscriptionIdTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class CancelOfferingBySubscriptionIdTransactionHttpAdapter
  implements CancelOfferingBySubscriptionIdTransactionPort
{
  constructor(
    private readonly cancelOfferingBySubscriptionIdTransactionAppService: CancelOfferingBySubscriptionIdTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Cancels an offering by specific subscription IDs" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":marketContractId/offerings/:offeringId/subscription-cancellations")
  async cancelOfferingBySubscriptionIdTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
    @Body() request: CancelOfferingBySubscriptionIdTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CancelOfferingBySubscriptionIdTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      offeringId,
      request.subscriptionIds,
    )
    return await this.cancelOfferingBySubscriptionIdTransactionAppService.execute(appServiceRequest)
  }
}
