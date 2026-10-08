// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { Body, Post } from "@nestjs/common"
import { DeployPrimaryMarketTransactionPort } from "./DeployPrimaryMarketTransactionPort"
import { DeployPrimaryMarketTransactionRequest } from "./model/DeployPrimaryMarketTransactionRequest"
import { DeployPrimaryMarketTransactionAppService } from "@app/transaction/deployprimarymarket/service/DeployPrimaryMarketTransactionAppService"
import { DeployPrimaryMarketTransactionAppServiceRequest } from "@app/transaction/deployprimarymarket/service/model/DeployPrimaryMarketTransactionAppServiceRequest"
import { ConfigService } from "@nestjs/config"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class DeployPrimaryMarketTransactionHttpAdapter implements DeployPrimaryMarketTransactionPort {
  constructor(
    private readonly deployPrimaryMarketTransactionAppService: DeployPrimaryMarketTransactionAppService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: "Deploys a new primary market contract" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post()
  async deployPrimaryMarketTransaction(
    @Body() request: DeployPrimaryMarketTransactionRequest,
  ): Promise<TransactionResponse> {
    const blockchainListenerContracts = this.configService.get<string>("BLOCKCHAIN_LISTENER_CONTRACTS") ?? ""

    const primaryMarketFactoryEvmAddress = blockchainListenerContracts.split(/[;,]/)[0].trim()
    const primaryMarketFactoryContractId = await ConverterUtils.getHederaAddressFromEvm(primaryMarketFactoryEvmAddress)

    const appServiceRequest = new DeployPrimaryMarketTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      primaryMarketFactoryContractId,
      request.resolverContractId,
      request.configVersion,
    )

    return await this.deployPrimaryMarketTransactionAppService.execute(appServiceRequest)
  }
}
