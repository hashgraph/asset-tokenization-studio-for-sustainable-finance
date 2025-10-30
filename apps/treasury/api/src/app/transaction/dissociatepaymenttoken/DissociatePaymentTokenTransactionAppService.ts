// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { DissociatePaymentTokenTransactionAppServiceRequest } from "./model/DissociatePaymentTokenTransactionAppServiceRequest"
import { BuildDissociateTokenTransactionRequest } from "@port/transactionbuilder/model/BuildDissociateTokenTransactionRequest"

@Singleton()
export class DissociatePaymentTokenTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(request: DissociatePaymentTokenTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return this.transactionBuilderPort.dissociateToken(
      new BuildDissociateTokenTransactionRequest(
        request.paymentTokenContractId,
        request.format,
        request.accountId || "",
        request.contractId,
      ),
    )
  }
}
