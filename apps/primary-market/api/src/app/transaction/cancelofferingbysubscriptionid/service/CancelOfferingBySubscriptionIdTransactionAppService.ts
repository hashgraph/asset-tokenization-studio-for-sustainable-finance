// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CancelOfferingBySubscriptionIdTransactionAppServiceRequest } from "./model/CancelOfferingBySubscriptionIdTransactionAppServiceRequest"

@Singleton()
export class CancelOfferingBySubscriptionIdTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(
    request: CancelOfferingBySubscriptionIdTransactionAppServiceRequest,
  ): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.cancelOfferingBySubscriptionIds(request)
  }
}
