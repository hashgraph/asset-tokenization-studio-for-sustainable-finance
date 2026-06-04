// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { SetKpiInterestRateTransactionAppServiceRequest } from "@app/transaction/interestrate/setkpiinterestratetransaction/service/model/SetKpiInterestRateTransactionAppServiceRequest"

@Singleton()
export class SetKpiInterestRateTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: SetKpiInterestRateTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.setInterestRateTransaction(request)
  }
}
