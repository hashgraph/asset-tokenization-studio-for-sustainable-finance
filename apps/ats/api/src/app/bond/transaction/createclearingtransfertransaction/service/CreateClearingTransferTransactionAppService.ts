// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CreateClearingTransferTransactionAppServiceRequest } from "@app/bond/transaction/createclearingtransfertransaction/service/model/CreateClearingTransferTransactionAppServiceRequest"

@Singleton()
export class CreateClearingTransferTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CreateClearingTransferTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.createClearingTransferTransaction(request)
  }
}
