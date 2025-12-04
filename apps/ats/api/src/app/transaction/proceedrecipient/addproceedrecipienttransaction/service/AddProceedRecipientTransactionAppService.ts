// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { AddProceedRecipientTransactionAppServiceRequest } from "@app/transaction/proceedrecipient/addproceedrecipienttransaction/service/model/AddProceedRecipientTransactionAppServiceRequest"

@Singleton()
export class AddProceedRecipientTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: AddProceedRecipientTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.addProceedRecipientTransaction(request)
  }
}
