// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { FundProceedsRecipientTransactionRequest } from "./model/FundProceedsRecipientTransactionRequest"

export interface FundProceedsRecipientTransactionPort {
  fundProceedsRecipient(request: FundProceedsRecipientTransactionRequest): Promise<TransactionResponse>
}
