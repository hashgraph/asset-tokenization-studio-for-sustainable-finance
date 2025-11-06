// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenAddedEvent extends Event {
  constructor(
    readonly treasuryContractId: string,
    readonly bondContractId: string,
    readonly paymentTokenContractId: string,
  ) {
    super()
  }
}
