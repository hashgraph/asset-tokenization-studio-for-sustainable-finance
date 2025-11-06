// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenDissociationErrorUpdatedEvent extends Event {
  readonly treasuryId: string
  readonly paymentTokenId: string

  constructor(treasuryId: string, paymentTokenId: string) {
    super()
    this.treasuryId = treasuryId
    this.paymentTokenId = paymentTokenId
  }
}
