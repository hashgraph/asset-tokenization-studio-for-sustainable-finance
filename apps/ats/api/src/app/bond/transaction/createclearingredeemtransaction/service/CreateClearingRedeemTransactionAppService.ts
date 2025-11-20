// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { CreateClearingRedeemTransactionAppServiceRequest } from "@app/bond/transaction/createclearingredeemtransaction/service/model/CreateClearingRedeemTransactionAppServiceRequest"

@Singleton()
export class CreateClearingRedeemTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CreateClearingRedeemTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.createClearingRedeemTransaction(request)
  }
}
