// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "../../../../port.adapter/transactionbuilder/TransactionBuilderPort"
import { FundProceedsRecipientTransactionAppServiceRequest } from "./model/FundProceedsRecipientTransactionAppServiceRequest"

@Singleton()
export class FundProceedsRecipientTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: FundProceedsRecipientTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return this.transactionBuilderPort.fundProceedsRecipient(request)
  }
}
