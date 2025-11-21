// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExecuteHoldAppServiceRequest } from "@app/bond/transaction/executeholdtransaction/service/model/ExecuteHoldAppServiceRequest"
import { BuildExecuteHoldTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteHoldTransactionRequest"

@Singleton()
export class ExecuteHoldAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: ExecuteHoldAppServiceRequest): Promise<TransactionAppServiceResponse> {
    const buildRequest = new BuildExecuteHoldTransactionRequest(
      request.format,
      request.accountId,
      request.contractId,
      request.holderAccountId,
      request.partition,
      request.holdId,
      request.toAccountId,
      request.amount,
    )

    return await this.transactionBuilderPort.executeHoldTransaction(buildRequest)
  }
}
