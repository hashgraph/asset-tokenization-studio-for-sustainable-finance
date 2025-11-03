// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { SetBondCapTransactionAppServiceRequest } from "@app/bond/transaction/setbondcaptransaction/service/model/SetBondCapTransactionAppServiceRequest"

@Singleton()
export class SetBondCapTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: SetBondCapTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.setBondCapTransaction(request)
  }
}
