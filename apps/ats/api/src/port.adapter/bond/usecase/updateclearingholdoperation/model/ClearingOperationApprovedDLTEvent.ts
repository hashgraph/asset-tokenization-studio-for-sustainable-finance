// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ClearingOperationApprovedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly clearingId: number
  readonly clearingOperationType: number
  readonly holdId?: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    clearingId: number,
    clearingOperationType: number,
    holdId?: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.clearingId = clearingId
    this.clearingOperationType = clearingOperationType
    this.holdId = holdId
  }
}
