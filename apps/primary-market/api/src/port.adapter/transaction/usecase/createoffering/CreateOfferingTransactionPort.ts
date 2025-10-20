// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from '@hashgraph/green-bonds-shared-core'
import { CreateOfferingTransactionRequest } from './model/CreateOfferingTransactionRequest'

export interface CreateOfferingTransactionPort {
  createOfferingTransaction(
    marketContractId: string,
    bondContractId: string,
    request: CreateOfferingTransactionRequest,
  ): TransactionResponse
}
