// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExecuteOfferingTransactionAppServiceRequest } from "./model/ExecuteOfferingTransactionAppServiceRequest"

@Singleton()
export class ExecuteOfferingTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: ExecuteOfferingTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.executeOffering(request)
  }
}
