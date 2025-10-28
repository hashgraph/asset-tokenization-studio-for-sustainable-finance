// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { SubmitSubscriptionTransactionAppServiceRequest } from "./model/SubmitSubscriptionTransactionAppServiceRequest"

@Singleton()
export class SubmitSubscriptionTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: SubmitSubscriptionTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.submitSubscription(request)
  }
}
