// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenDissociationErrorUpdatedEvent extends Event {
  readonly treasuryContractId: string
  readonly paymentTokenContractId: string

  constructor(treasuryContractId: string, paymentTokenContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.paymentTokenContractId = paymentTokenContractId
  }
}
