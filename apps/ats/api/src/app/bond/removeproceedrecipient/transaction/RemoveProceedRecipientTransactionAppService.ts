// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { RemoveProceedRecipientTransactionAppServiceRequest } from "./RemoveProceedRecipientTransactionAppServiceRequest"

@Singleton()
export class RemoveProceedRecipientTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: RemoveProceedRecipientTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.removeProceedRecipientTransaction(request)
  }
}
