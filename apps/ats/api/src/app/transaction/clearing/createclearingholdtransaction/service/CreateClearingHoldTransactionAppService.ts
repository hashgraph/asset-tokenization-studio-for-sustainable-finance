// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CreateClearingHoldTransactionAppServiceRequest } from "@app/transaction/clearing/createclearingholdtransaction/service/model/CreateClearingHoldTransactionAppServiceRequest"

@Singleton()
export class CreateClearingHoldTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CreateClearingHoldTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.createClearingHoldTransaction(request)
  }
}
