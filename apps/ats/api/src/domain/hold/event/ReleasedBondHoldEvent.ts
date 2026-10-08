// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class ReleasedBondHoldEvent extends Event {
  readonly holdId: number
  readonly bondContractId: string
  readonly holderAccountId: string
  readonly partition: string
  readonly amount: string

  constructor(holdId: number, bondContractId: string, holderAccountId: string, partition: string, amount: string) {
    super()
    this.holdId = holdId
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
  }
}
