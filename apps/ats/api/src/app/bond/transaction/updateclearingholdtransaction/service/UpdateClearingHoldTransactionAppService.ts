// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { UpdateClearingHoldTransactionAppServiceRequest } from "@app/bond/transaction/updateclearingholdtransaction/service/model/UpdateClearingHoldTransactionAppServiceRequest"
import { ClearingActionType } from "@app/bond/transaction/updateclearingholdtransaction/service/model/ClearingActionType"
import { BuildApproveClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingHoldTransactionRequest"
import { BuildReclaimClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingHoldTransactionRequest"

@Singleton()
export class UpdateClearingHoldTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: UpdateClearingHoldTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    switch (request.action) {
      case ClearingActionType.APPROVE: {
        const buildRequest = new BuildApproveClearingHoldTransactionRequest(
          request.format,
          request.accountId ?? "",
          request.contractId,
          request.holderAccountId,
          request.partition,
          request.clearingId,
          request.operationType,
        )
        return await this.transactionBuilderPort.approveClearingHoldTransaction(buildRequest)
      }
      case ClearingActionType.RECLAIM: {
        const buildRequest = new BuildReclaimClearingHoldTransactionRequest(
          request.format,
          request.accountId ?? "",
          request.contractId,
          request.holderAccountId,
          request.partition,
          request.clearingId,
          request.operationType,
        )
        return await this.transactionBuilderPort.reclaimClearingHoldTransaction(buildRequest)
      }
      default:
        throw new Error(`Invalid clearing action: ${request.action}`)
    }
  }
}
