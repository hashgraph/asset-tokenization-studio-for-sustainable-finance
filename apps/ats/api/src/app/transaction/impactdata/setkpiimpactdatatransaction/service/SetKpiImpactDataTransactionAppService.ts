// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { SetKpiImpactDataTransactionAppServiceRequest } from "@app/transaction/impactdata/setkpiimpactdatatransaction/service/model/SetKpiImpactDataTransactionAppServiceRequest"

@Singleton()
export class SetKpiImpactDataTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: SetKpiImpactDataTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.setImpactDataTransaction(request)
  }
}
