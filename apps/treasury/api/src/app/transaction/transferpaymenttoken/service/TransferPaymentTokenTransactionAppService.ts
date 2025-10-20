// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "../../../../port.adapter/transactionbuilder/TransactionBuilderPort"
import { TransferPaymentTokenTransactionAppServiceRequest } from "./model/TransferPaymentTokenTransactionAppServiceRequest"

@Singleton()
export class TransferPaymentTokenTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: TransferPaymentTokenTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.transferPaymentToken(request)
  }
}
