// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest } from "./model/ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest"

@Singleton()
export class ExecuteOfferingBySubscriptionIdTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(
    request: ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest,
  ): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.executeOfferingBySubscriptionIds(request)
  }
}
