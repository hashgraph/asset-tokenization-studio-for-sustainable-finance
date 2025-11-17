// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientRemovedEvent extends Event {
  readonly contractId: string
  readonly proceedRecipientAddress: string

  constructor(contractId: string, proceedRecipientAddress: string) {
    super()
    this.contractId = contractId
    this.proceedRecipientAddress = proceedRecipientAddress
  }
}
