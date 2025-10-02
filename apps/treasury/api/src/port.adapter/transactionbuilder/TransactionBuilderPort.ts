// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"

export interface TransactionBuilderPort {
  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse
}
