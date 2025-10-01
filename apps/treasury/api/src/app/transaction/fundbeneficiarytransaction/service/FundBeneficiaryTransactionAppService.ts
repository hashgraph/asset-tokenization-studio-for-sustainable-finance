// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "../../../../port.adapter/transactionbuilder/TransactionBuilderPort"
import { FundBeneficiaryTransactionAppServiceRequest } from "./model/FundBeneficiaryTransactionAppServiceRequest"

@Singleton()
export class FundBeneficiaryTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: FundBeneficiaryTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.fundBeneficiary(request)
  }
}
