// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ProceedsRecipientFundedDLTEvent extends DLTEvent {
  readonly proceedsRecipient: string
  readonly amount: string

  constructor(contractId: string, transactionHash: string, proceedsRecipient: string, amount: string) {
    super(contractId, transactionHash)
    this.proceedsRecipient = proceedsRecipient
    this.amount = amount
  }
}
