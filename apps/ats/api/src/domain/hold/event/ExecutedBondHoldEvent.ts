// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class ExecutedBondHoldEvent extends Event {
  readonly holdId: number
  readonly contractId: string
  readonly holderAccountId: string
  readonly toAccountId: string
  readonly partition: string
  readonly amount: string

  constructor(
    holdId: number,
    contractId: string,
    holderAccountId: string,
    toAccountId: string,
    partition: string,
    amount: string,
  ) {
    super()
    this.holdId = holdId
    this.contractId = contractId
    this.holderAccountId = holderAccountId
    this.toAccountId = toAccountId
    this.partition = partition
    this.amount = amount
  }
}
