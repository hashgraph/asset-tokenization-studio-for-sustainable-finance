// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenTransferAddedEvent extends Event {
  treasuryContractId: string
  recipientAccountId: string
  amount: string
  transferId: string

  constructor(treasuryContractId: string, recipientAccountId: string, amount: string, transferId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.recipientAccountId = recipientAccountId
    this.amount = amount
    this.transferId = transferId
  }
}
