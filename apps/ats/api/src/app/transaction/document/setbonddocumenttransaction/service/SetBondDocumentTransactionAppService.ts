// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { SetBondDocumentTransactionAppServiceRequest } from "@app/transaction/document/setbonddocumenttransaction/service/model/SetBondDocumentTransactionAppServiceRequest"

@Singleton()
export class SetBondDocumentTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: SetBondDocumentTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.setBondDocumentTransaction(request)
  }
}
