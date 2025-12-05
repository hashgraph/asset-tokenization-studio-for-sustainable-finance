// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ProceedRecipientAddedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly proceedRecipient: string
  readonly data: string

  constructor(contractId: string, transactionHash: string, operator: string, proceedRecipient: string, data: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.proceedRecipient = proceedRecipient
    this.data = data
  }
}
