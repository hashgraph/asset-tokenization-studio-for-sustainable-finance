// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController } from "@hashgraph/green-bonds-shared-core"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { ExecuteDistributionByAddressesTransactionRequest } from "@port/transaction/usecase/executedistributionbyaddresses/model/ExecuteDistributionByAddressesTransactionRequest"
import { ExecuteDistributionByAddressesTransactionPort } from "@port/transaction/usecase/executedistributionbyaddresses/ExecuteDistributionByAddressesTransactionPort"
import { ExecuteDistributionByAddressesTransactionAppService } from "@app/transaction/executedistributionbyaddresses/ExecuteDistributionByAddressesTransactionAppService"
import { ExecuteDistributionByAddressesTransactionAppServiceRequest } from "@app/transaction/executedistributionbyaddresses/model/ExecuteDistributionByAddressesTransactionAppServiceRequest"

@RestController("treasuries")
export class ExecuteDistributionByAddressesTransactionHttpAdapter
  implements ExecuteDistributionByAddressesTransactionPort
{
  constructor(private readonly appService: ExecuteDistributionByAddressesTransactionAppService) {}

  @Post(":treasuryContractId/distributions/:distributionId/holders")
  async executeDistributionByAddresses(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("distributionId") distributionId: number,
    @Body() request: ExecuteDistributionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse> {
    return await this.appService.execute(
      new ExecuteDistributionByAddressesTransactionAppServiceRequest(
        request.format,
        request.accountId!,
        treasuryContractId,
        distributionId,
        request.maxBatchSize!,
        request.holdersAccountIds,
      ),
    )
  }
}
