// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class LockedByPartitionDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly lockId: string
  readonly amount: string
  readonly expirationTimestamp: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    lockId: string,
    amount: string,
    expirationTimestamp: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.lockId = lockId
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
  }
}
