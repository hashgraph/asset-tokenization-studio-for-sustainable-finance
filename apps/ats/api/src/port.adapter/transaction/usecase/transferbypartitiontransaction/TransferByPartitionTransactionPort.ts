// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { TransferByPartitionTransactionRequest } from "./model/TransferByPartitionTransactionRequest"

export interface TransferByPartitionTransactionPort {
  transferByPartitionTransaction(
    bondContractId: string,
    holderAccountId: string,
    request: TransferByPartitionTransactionRequest,
  ): Promise<TransactionResponse>
}
