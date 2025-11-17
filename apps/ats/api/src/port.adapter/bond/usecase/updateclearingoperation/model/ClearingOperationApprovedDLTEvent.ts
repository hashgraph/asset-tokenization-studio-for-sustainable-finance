// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationType } from "@domain/bond/clearing/model/ClearingOperationType"

export class ClearingOperationApprovedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly clearingId: number
  readonly clearingOperationType: ClearingOperationType

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.clearingId = clearingId
    this.clearingOperationType = clearingOperationType
  }
}
