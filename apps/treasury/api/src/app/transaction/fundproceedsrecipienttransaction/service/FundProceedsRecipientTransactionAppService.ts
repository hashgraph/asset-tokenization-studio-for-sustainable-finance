// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "../../../../port.adapter/transactionbuilder/TransactionBuilderPort"
import { FundProceedsRecipientTransactionAppServiceRequest } from "./model/FundProceedsRecipientTransactionAppServiceRequest"
import { BuildFundProceedsRecipientTransactionRequest } from "../../../../port.adapter/transactionbuilder/model/BuildFundProceedsRecipientTransactionRequest"

@Singleton()
export class FundProceedsRecipientTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: FundProceedsRecipientTransactionAppServiceRequest): TransactionAppServiceResponse {
    const buildRequest = new BuildFundProceedsRecipientTransactionRequest(
      request.format,
      request.accountId || "",
      request.contractId,
    )
    buildRequest.address = request.address
    buildRequest.amount = request.amount

    return this.transactionBuilderPort.fundProceedsRecipient(buildRequest)
  }
}
