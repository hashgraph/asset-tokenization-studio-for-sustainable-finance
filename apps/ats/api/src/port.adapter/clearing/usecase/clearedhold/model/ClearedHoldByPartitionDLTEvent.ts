// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

interface Hold {
  amount: string
  expirationTimestamp: string
  escrow: string
  to: string
  data: string
}

export class ClearedHoldByPartitionDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly clearingId: string
  readonly hold: Hold
  readonly expirationDate: string
  readonly data: string
  readonly operatorData: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    clearingId: string,
    hold: Hold,
    expirationDate: string,
    data: string,
    operatorData: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.clearingId = clearingId
    this.hold = hold
    this.expirationDate = expirationDate
    this.data = data
    this.operatorData = operatorData
  }
}
