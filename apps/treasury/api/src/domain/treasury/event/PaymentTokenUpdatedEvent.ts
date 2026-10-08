// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenUpdatedEvent extends Event {
  treasuryContractId: string
  bondContractId: string
  paymentTokenContractId: string

  constructor(treasuryContractId: string, bondContractId: string, paymentTokenContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.bondContractId = bondContractId
    this.paymentTokenContractId = paymentTokenContractId
  }
}
