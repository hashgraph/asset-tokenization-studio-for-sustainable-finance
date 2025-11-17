// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ProceedRecipientRemovedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly proceedRecipient: string

  constructor(contractId: string, transactionHash: string, operator: string, proceedRecipient: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.proceedRecipient = proceedRecipient
  }
}
