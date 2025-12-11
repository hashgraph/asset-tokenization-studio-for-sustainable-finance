// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientRemovedEvent extends Event {
  readonly bondContractId: string
  readonly proceedRecipientAddress: string

  constructor(bondContractId: string, proceedRecipientAddress: string) {
    super()
    this.bondContractId = bondContractId
    this.proceedRecipientAddress = proceedRecipientAddress
  }
}
