// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { DeleteControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/deletecontrollistmembertransaction/service/model/DeleteControlListMemberTransactionAppServiceRequest"

@Singleton()
export class DeleteControlListMemberTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: DeleteControlListMemberTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.deleteControlListMemberTransaction(request)
  }
}
