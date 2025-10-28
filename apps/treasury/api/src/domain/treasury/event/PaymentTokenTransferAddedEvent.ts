// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenTransferAddedEvent extends Event {
  paymentTokenId: string
  accountId: string
  amount: string
  type: string

  constructor(paymentTokenId: string, accountId: string, amount: string, type: string) {
    super()
    this.paymentTokenId = paymentTokenId
    this.accountId = accountId
    this.amount = amount
    this.type = type
  }
}
