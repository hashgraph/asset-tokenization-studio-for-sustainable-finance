// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CancelClearingTransactionAppServiceRequest } from "@app/bond/transaction/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"

@Singleton()
export class CancelClearingTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(
    request: CancelClearingTransactionAppServiceRequest,
  ): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.cancelClearingTransaction(request)
  }
}
