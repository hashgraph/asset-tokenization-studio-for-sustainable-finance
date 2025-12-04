// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class RedeemedBondHolderBalanceEvent extends Event {
  constructor(
    public readonly contractId: string,
    public readonly holderAccountId: string,
    public readonly partition: string,
    public readonly amount: string,
  ) {
    super()
  }
}
