// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { UpdateClearingTransactionAppServiceRequest } from "@app/transaction/clearing/updateclearingholdtransaction/service/model/UpdateClearingTransactionAppServiceRequest"
import { ClearingActionType } from "@app/transaction/clearing/updateclearingholdtransaction/service/model/ClearingActionType"
import { BuildApproveClearingTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingTransactionRequest"
import { BuildReclaimClearingTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingTransactionRequest"
import { InvalidClearingActionError } from "@domain/clearing/errors/InvalidClearingActionError"

@Singleton()
export class UpdateClearingHoldTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: UpdateClearingTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    switch (request.action) {
      case ClearingActionType.APPROVE: {
        const buildRequest = new BuildApproveClearingTransactionRequest(
          request.format,
          request.accountId ?? "",
          request.contractId,
          request.holderAccountId,
          request.partition,
          request.clearingId,
          request.operationType,
        )
        return await this.transactionBuilderPort.approveClearingTransaction(buildRequest)
      }
      case ClearingActionType.RECLAIM: {
        const buildRequest = new BuildReclaimClearingTransactionRequest(
          request.format,
          request.accountId ?? "",
          request.contractId,
          request.holderAccountId,
          request.partition,
          request.clearingId,
          request.operationType,
        )
        return await this.transactionBuilderPort.reclaimClearingTransaction(buildRequest)
      }
      default:
        throw InvalidClearingActionError.forAction(request.action)
    }
  }
}
