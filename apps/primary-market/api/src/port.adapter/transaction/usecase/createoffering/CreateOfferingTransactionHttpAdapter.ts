// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateOfferingTransactionRequest } from "./model/CreateOfferingTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { CreateOfferingTransactionPort } from "./CreateOfferingTransactionPort"
import { CreateOfferingTransactionAppService } from "@app/transaction/createoffering/service/CreateOfferingTransactionAppService"
import { CreateOfferingTransactionAppServiceRequest } from "@app/transaction/createoffering/service/model/CreateOfferingTransactionAppServiceRequest"

@RestController("primary-markets")
export class CreateOfferingTransactionHttpAdapter implements CreateOfferingTransactionPort {
  constructor(private readonly createOfferingTransactionAppService: CreateOfferingTransactionAppService) {}

  @Post(":marketContractId/bonds/:bondContractId")
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
      request.minQuantity,
      request.maxQuantity,
      request.targetQuantity,
      request.targetQuantityRule,
      request.startDate,
      request.endDate,
      request.deadlineRule,
    )
    return await this.createOfferingTransactionAppService.execute(appServiceRequest)
  }
}
