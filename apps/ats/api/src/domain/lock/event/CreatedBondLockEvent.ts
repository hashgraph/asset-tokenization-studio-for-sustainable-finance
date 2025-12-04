// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class CreatedBondLockEvent extends Event {
  readonly id: number
  readonly contractId: string
  readonly holderAccountId: string
  readonly partition: string
  readonly amount: string
  readonly expirationTimestamp: Date
  readonly operatorAccountId: string

  constructor(
    id: number,
    contractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    expirationTimestamp: Date,
    operatorAccountId: string,
  ) {
    super()
    this.id = id
    this.contractId = contractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.operatorAccountId = operatorAccountId
  }
}
