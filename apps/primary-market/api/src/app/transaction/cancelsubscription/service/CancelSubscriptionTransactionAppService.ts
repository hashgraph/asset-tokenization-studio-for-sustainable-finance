// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CancelSubscriptionTransactionAppServiceRequest } from "./model/CancelSubscriptionTransactionAppServiceRequest"

@Singleton()
export class CancelSubscriptionTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CancelSubscriptionTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.cancelSubscription(request)
  }
}
