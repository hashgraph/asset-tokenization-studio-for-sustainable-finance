// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import { DeployPrimaryMarketTransactionAppServiceRequest } from "./model/DeployPrimaryMarketTransactionAppServiceRequest"

@Singleton()
export class DeployPrimaryMarketTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: DeployPrimaryMarketTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.deployPrimaryMarket(request)
  }
}
