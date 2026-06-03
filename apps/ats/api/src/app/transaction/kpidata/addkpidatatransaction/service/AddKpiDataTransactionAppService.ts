// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { AddKpiDataTransactionAppServiceRequest } from "@app/transaction/kpidata/addkpidatatransaction/service/model/AddKpiDataTransactionAppServiceRequest"

@Singleton()
export class AddKpiDataTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: AddKpiDataTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.addKpiDataTransaction(request)
  }
}
