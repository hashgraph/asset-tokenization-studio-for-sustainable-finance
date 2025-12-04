// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ClearedTransferByPartitionDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly clearingId: string
  readonly amount: string
  readonly expirationDate: string
  readonly to: string
  readonly data: string
  readonly operatorData: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    clearingId: string,
    amount: string,
    expirationDate: string,
    to: string,
    data: string,
    operatorData: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.clearingId = clearingId
    this.amount = amount
    this.expirationDate = expirationDate
    this.to = to
    this.data = data
    this.operatorData = operatorData
  }
}
