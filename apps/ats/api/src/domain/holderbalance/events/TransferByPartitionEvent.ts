// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class TransferByPartitionEvent extends Event {
  readonly bondContractId: string
  readonly partition: string
  readonly fromAccountId: string
  readonly toAccountId: string
  readonly amount: string
  readonly operatorAccountId: string

  constructor(
    bondContractId: string,
    partition: string,
    fromAccountId: string,
    toAccountId: string,
    amount: string,
    operatorAccountId: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.partition = partition
    this.fromAccountId = fromAccountId
    this.toAccountId = toAccountId
    this.amount = amount
    this.operatorAccountId = operatorAccountId
  }
}
