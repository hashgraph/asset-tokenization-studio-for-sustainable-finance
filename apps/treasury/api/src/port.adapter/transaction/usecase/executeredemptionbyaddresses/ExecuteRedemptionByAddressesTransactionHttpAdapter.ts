// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { ExecuteRedemptionByAddressesTransactionRequest } from "@port/transaction/usecase/executeredemptionbyaddresses/model/ExecuteRedemptionByAddressesTransactionRequest"
import { ExecuteRedemptionByAddressesTransactionAppService } from "@app/transaction/executeredemptionbyaddresses/ExecuteRedemptionByAddressesTransactionAppService"
import { ExecuteRedemptionByAddressesTransactionAppServiceRequest } from "@app/transaction/executeredemptionbyaddresses/model/ExecuteRedemptionByAddressesTransactionAppServiceRequest"
import { ExecuteRedemptionByAddressesTransactionPort } from "./ExecuteRedemptionByAddressesTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class ExecuteRedemptionByAddressesTransactionHttpAdapter implements ExecuteRedemptionByAddressesTransactionPort {
  constructor(private readonly appService: ExecuteRedemptionByAddressesTransactionAppService) {}

  @ApiOperation({
    summary:
      "Executes a redemption for a list of holder account ids. A list of transactions for" +
      " each batch will be returned. In this case there is only 1 page for all transactions for all addresses",
  })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/redemptions/holders")
  async executeRedemptionByAddresses(
    @Param("treasuryId") treasuryContractId: string,
    @Body() request: ExecuteRedemptionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse> {
    return await this.appService.execute(
      new ExecuteRedemptionByAddressesTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        request.maxBatchSize!,
        request.holdersAccountIds,
      ),
    )
  }
}
