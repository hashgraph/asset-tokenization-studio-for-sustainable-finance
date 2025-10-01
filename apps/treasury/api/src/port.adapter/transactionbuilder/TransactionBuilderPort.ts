// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildFundBeneficiaryTransactionRequest } from "./model/BuildFundBeneficiaryTransactionRequest"

export interface TransactionBuilderPort {
  fundBeneficiary(request: BuildFundBeneficiaryTransactionRequest): BuildTransactionResponse
}
