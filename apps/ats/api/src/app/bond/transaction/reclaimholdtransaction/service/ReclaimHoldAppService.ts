// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ReclaimHoldAppServiceRequest } from "@app/bond/transaction/reclaimholdtransaction/service/model/ReclaimHoldAppServiceRequest"
import { BuildReclaimHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimHoldTransactionRequest"

@Singleton()
export class ReclaimHoldAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: ReclaimHoldAppServiceRequest): Promise<TransactionAppServiceResponse> {
    const buildRequest = new BuildReclaimHoldTransactionRequest(
      request.format,
      request.accountId,
      request.contractId,
      request.holderAccountId,
      request.partition,
      request.holdId,
    )

    return await this.transactionBuilderPort.reclaimHoldTransaction(buildRequest)
  }
}
