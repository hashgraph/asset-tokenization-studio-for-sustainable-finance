// SPDX-License-Identifier: Apache-2.0
import type { TransactionResponse } from "@hashgraph/green-bonds-shared-core"

export interface AddProceedRecipientTransactionPort {
  addProceedRecipientTransaction(
    bondContractId: string,
    proceedRecipientAddress: string,
    data: string,
  ): Promise<TransactionResponse>
}
