// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CreateBondLockTransactionAppServiceRequest } from "@app/bond/transaction/createbondlocktransaction/service/model/CreateBondLockTransactionAppServiceRequest"

@Singleton()
export class CreateBondLockTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CreateBondLockTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.createBondLockTransaction(request)
  }
}
