// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { FundBeneficiaryTransactionRequest } from "./model/FundBeneficiaryTransactionRequest"

export interface FundBeneficiaryTransactionPort {
  fundBeneficiary(request: FundBeneficiaryTransactionRequest): Promise<TransactionResponse>
}
