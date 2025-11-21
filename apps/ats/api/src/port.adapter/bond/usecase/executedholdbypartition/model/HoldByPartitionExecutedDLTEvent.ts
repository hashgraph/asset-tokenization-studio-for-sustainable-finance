// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class HoldByPartitionExecutedDLTEvent extends DLTEvent {
  readonly tokenHolder: string
  readonly partition: string
  readonly holdId: number
  readonly amount: string
  readonly to: string

  constructor(
    contractId: string,
    transactionHash: string,
    tokenHolder: string,
    partition: string,
    holdId: number,
    amount: string,
    to: string,
  ) {
    super(contractId, transactionHash)
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.holdId = holdId
    this.amount = amount
    this.to = to
  }
}
