// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExternalTransferPaymentTokenTransactionAppServiceRequest } from "@app/transaction/externaltransferpaymenttoken/service/model/ExternalTransferPaymentTokenTransactionAppServiceRequest"

@Singleton()
export class ExternalTransferPaymentTokenTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  execute(request: ExternalTransferPaymentTokenTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.externalTransferPaymentToken(request)
  }
}
