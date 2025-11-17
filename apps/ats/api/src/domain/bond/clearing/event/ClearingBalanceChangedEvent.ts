// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class ClearingBalanceChangedEvent extends Event {
  constructor(
    public readonly bondContractId: string,
    public readonly holderAccountId: string,
    public readonly partition: string,
    public readonly amount: string,
    public readonly balanceOperation: "CLEARING_LOCK" | "CLEARING_UNLOCK" | "CLEARING_EXECUTE",
  ) {
    super()
  }
}
