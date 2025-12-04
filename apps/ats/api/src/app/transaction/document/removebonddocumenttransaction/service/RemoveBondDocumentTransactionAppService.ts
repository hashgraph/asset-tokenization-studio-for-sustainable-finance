// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { RemoveBondDocumentTransactionAppServiceRequest } from "@app/transaction/document/removebonddocumenttransaction/service/model/RemoveBondDocumentTransactionAppServiceRequest"

@Singleton()
export class RemoveBondDocumentTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: RemoveBondDocumentTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.removeBondDocumentTransaction(request)
  }
}
