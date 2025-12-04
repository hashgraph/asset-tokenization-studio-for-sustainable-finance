// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

interface Hold {
  amount: string
  expirationTimestamp: string
  escrow: string
  to: string
  data: string
}

export class HeldByPartitionDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly holdId: string
  readonly hold: Hold
  readonly operatorData: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    holdId: string,
    hold: Hold,
    operatorData: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.holdId = holdId
    this.hold = hold
    this.operatorData = operatorData
  }
}
