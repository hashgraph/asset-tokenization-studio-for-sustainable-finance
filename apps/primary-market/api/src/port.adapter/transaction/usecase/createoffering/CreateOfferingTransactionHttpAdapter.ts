// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateOfferingTransactionRequest } from "./model/CreateOfferingTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { CreateOfferingTransactionPort } from "./CreateOfferingTransactionPort"
import { CreateOfferingTransactionAppService } from "@app/transaction/createoffering/service/CreateOfferingTransactionAppService"
import { CreateOfferingTransactionAppServiceRequest } from "@app/transaction/createoffering/service/model/CreateOfferingTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class CreateOfferingTransactionHttpAdapter implements CreateOfferingTransactionPort {
  constructor(private readonly createOfferingTransactionAppService: CreateOfferingTransactionAppService) {}

  @ApiOperation({ summary: "Creates a new offering for a bond" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":marketContractId/bonds/:bondContractId/offerings")
  async createOfferingTransaction(
    @Param("marketContractId") marketContractId: string,
    @Param("bondContractId") bondContractId: string,
    @Body() request: CreateOfferingTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new CreateOfferingTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      marketContractId,
      bondContractId,
      request.treasuryAddress,
      request.paymentTokenAddress,
      request.lotSize,
      request.minLots,
      request.maxLots,
      request.targetLots,
      request.targetQuantityRule,
      request.startDate,
      request.endDate,
      request.deadlineRule,
      request.price,
    )
    return await this.createOfferingTransactionAppService.execute(appServiceRequest)
  }
}
