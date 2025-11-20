// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { ExecuteDistributionByAddressesTransactionRequest } from "@port/transaction/usecase/executedistributionbyaddresses/model/ExecuteDistributionByAddressesTransactionRequest"
import { ExecuteDistributionByAddressesTransactionPort } from "@port/transaction/usecase/executedistributionbyaddresses/ExecuteDistributionByAddressesTransactionPort"
import { ExecuteDistributionByAddressesTransactionAppService } from "@app/transaction/executedistributionbyaddresses/ExecuteDistributionByAddressesTransactionAppService"
import { ExecuteDistributionByAddressesTransactionAppServiceRequest } from "@app/transaction/executedistributionbyaddresses/model/ExecuteDistributionByAddressesTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class ExecuteDistributionByAddressesTransactionHttpAdapter
  implements ExecuteDistributionByAddressesTransactionPort
{
  constructor(private readonly appService: ExecuteDistributionByAddressesTransactionAppService) {}

  @ApiOperation({
    summary:
      "Executes a distribution for a list of holder account ids. A list of transactions for" +
      " each batch will be returned. In this case there is only 1 page for all transactions for all addresses",
  })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/distributions/:distributionId/holders")
  async executeDistributionByAddresses(
    @Param("treasuryId") treasuryContractId: string,
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
