// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class RedeemedByPartitionDLTEvent extends DLTEvent {
  readonly partition: string
  readonly operator: string
  readonly from: string
  readonly value: string
  readonly data: string
  readonly operatorData: string

  constructor(
    contractId: string,
    transactionHash: string,
    partition: string,
    operator: string,
    from: string,
    value: string,
    data: string,
    operatorData: string,
  ) {
    super(contractId, transactionHash)
    this.partition = partition
    this.operator = operator
    this.from = from
    this.value = value
    this.data = data
    this.operatorData = operatorData
  }
}
