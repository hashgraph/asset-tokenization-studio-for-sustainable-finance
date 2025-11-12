// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildReclaimClearingTransactionRequest extends BaseTransactionRequest {
  holderAccountId: string
  partition?: string
  clearingId: number
  operationType: number
  contractId: string

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    holderAccountId: string,
    partition: string | undefined,
    clearingId: number,
    operationType: number,
  ) {
    super(format, accountId)
    this.contractId = contractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.clearingId = clearingId
    this.operationType = operationType
  }
}
