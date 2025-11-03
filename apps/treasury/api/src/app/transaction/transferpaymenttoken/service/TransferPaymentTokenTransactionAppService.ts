// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "../../../../port.adapter/transactionbuilder/TransactionBuilderPort"
import { TransferPaymentTokenTransactionAppServiceRequest } from "./model/TransferPaymentTokenTransactionAppServiceRequest"

@Singleton()
export class TransferPaymentTokenTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(request: TransferPaymentTokenTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return this.transactionBuilderPort.transferPaymentToken(request)
  }
}
