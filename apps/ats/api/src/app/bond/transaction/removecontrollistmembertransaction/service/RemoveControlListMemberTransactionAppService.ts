// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { RemoveControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/removecontrollistmembertransaction/service/model/RemoveControlListMemberTransactionAppServiceRequest"

@Singleton()
export class RemoveControlListMemberTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: RemoveControlListMemberTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.removeControlListMemberTransaction(request)
  }
}
