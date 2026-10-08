// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class KpiDataAddedDLTEvent extends DLTEvent {
  readonly project: string
  readonly date: string
  readonly value: string

  constructor(bondContractId: string, transactionHash: string, project: string, date: string, value: string) {
    super(bondContractId, transactionHash)
    this.project = project
    this.date = date
    this.value = value
  }
}
