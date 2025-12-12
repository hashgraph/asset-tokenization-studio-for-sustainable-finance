// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientAddedEvent extends Event {
  constructor(
    public readonly bondContractId: string,
    public readonly proceedRecipientAddress: string,
    public readonly data?: string,
  ) {
    super()
  }
}
