// SPDX-License-Identifier: Apache-2.0
import type { TransactionResponse } from "@hashgraph/green-bonds-shared-core"

export interface RemoveProceedRecipientTransactionPort {
  removeProceedRecipientTransaction(
    bondContractId: string,
    proceedRecipientAddress: string,
  ): Promise<TransactionResponse>
}
