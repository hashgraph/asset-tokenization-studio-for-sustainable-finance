// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class HeldByPartitionDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly holdId: number
  readonly amount: string
  readonly expirationTimestamp: string
  readonly escrow: string
  readonly to: string
  readonly data: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    holdId: number,
    amount: string,
    expirationTimestamp: string,
    escrow: string,
    to: string,
    data: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.holdId = holdId
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.escrow = escrow
    this.to = to
    this.data = data
  }
}
