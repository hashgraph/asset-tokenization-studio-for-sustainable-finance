// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { Body, Post } from "@nestjs/common"
import { DeployPrimaryMarketTransactionPort } from "./DeployPrimaryMarketTransactionPort"
import { DeployPrimaryMarketTransactionRequest } from "./model/DeployPrimaryMarketTransactionRequest"
import { DeployPrimaryMarketTransactionAppService } from "@app/transaction/deployprimarymarket/service/DeployPrimaryMarketTransactionAppService"
import { DeployPrimaryMarketTransactionAppServiceRequest } from "@app/transaction/deployprimarymarket/service/model/DeployPrimaryMarketTransactionAppServiceRequest"
import { ConfigService } from "@nestjs/config"

@RestController("primary-markets")
export class DeployPrimaryMarketTransactionHttpAdapter implements DeployPrimaryMarketTransactionPort {
  constructor(
    private readonly deployPrimaryMarketTransactionAppService: DeployPrimaryMarketTransactionAppService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async deployPrimaryMarketTransaction(
    @Body() request: DeployPrimaryMarketTransactionRequest,
  ): Promise<TransactionResponse> {
    const primaryMarketFactoryEvmAddress = this.configService.get<string>("BLOCKCHAIN_LISTENER_CONTRACTS") ?? ""
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
