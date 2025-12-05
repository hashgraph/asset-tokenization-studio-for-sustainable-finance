// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CreateBondHoldTransactionAppServiceRequest } from "@app/transaction/hold/createbondholdtransaction/service/model/CreateBondHoldTransactionAppServiceRequest"

@Singleton()
export class CreateBondHoldTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CreateBondHoldTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.createBondHoldTransaction(request)
  }
}
