// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class IssuedByPartitionDLTEvent extends DLTEvent {
  readonly partition: string
  readonly operator: string
  readonly to: string
  readonly value: string
  readonly data: string

  constructor(
    contractId: string,
    transactionHash: string,
    partition: string,
    operator: string,
    to: string,
    value: string,
    data: string,
  ) {
    super(contractId, transactionHash)
    this.partition = partition
    this.operator = operator
    this.to = to
    this.value = value
    this.data = data
  }
}
