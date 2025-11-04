// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController } from "@hashgraph/green-bonds-shared-core"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { ExecuteRedemptionByAddressesTransactionRequest } from "@port/transaction/usecase/executeredemptionbyaddresses/model/ExecuteRedemptionByAddressesTransactionRequest"
import { ExecuteRedemptionByAddressesTransactionAppService } from "@app/transaction/executeredemptionbyaddresses/ExecuteRedemptionByAddressesTransactionAppService"
import { ExecuteRedemptionByAddressesTransactionAppServiceRequest } from "@app/transaction/executeredemptionbyaddresses/model/ExecuteRedemptionByAddressesTransactionAppServiceRequest"
import { ExecuteRedemptionByAddressesTransactionPort } from "./ExecuteRedemptionByAddressesTransactionPort"

@RestController("treasuries")
export class ExecuteRedemptionByAddressesTransactionHttpAdapter implements ExecuteRedemptionByAddressesTransactionPort {
  constructor(private readonly appService: ExecuteRedemptionByAddressesTransactionAppService) {}

  @Post(":treasuryContractId/redemptions/holders")
  async executeRedemptionByAddresses(
    @Param("treasuryContractId") treasuryContractId: string,
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
