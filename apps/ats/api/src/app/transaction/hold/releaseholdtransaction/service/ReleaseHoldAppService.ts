// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ReleaseHoldAppServiceRequest } from "@app/transaction/hold/releaseholdtransaction/service/model/ReleaseHoldAppServiceRequest"
import { BuildReleaseHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReleaseHoldTransactionRequest"

@Singleton()
export class ReleaseHoldAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: ReleaseHoldAppServiceRequest): Promise<TransactionAppServiceResponse> {
    const buildRequest = new BuildReleaseHoldTransactionRequest(
      request.format,
      request.accountId,
      request.contractId,
      request.holderAccountId,
      request.partition,
      request.holdId,
      request.amount,
    )

    return await this.transactionBuilderPort.releaseHoldTransaction(buildRequest)
  }
}
