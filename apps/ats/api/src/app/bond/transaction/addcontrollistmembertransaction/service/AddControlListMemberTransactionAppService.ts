// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { AddControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/addcontrollistmembertransaction/service/model/AddControlListMemberTransactionAppServiceRequest"

@Singleton()
export class AddControlListMemberTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: AddControlListMemberTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.addControlListMemberTransaction(request)
  }
}
