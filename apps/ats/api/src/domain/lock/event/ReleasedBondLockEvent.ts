// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class ReleasedBondLockEvent extends Event {
  constructor(
    public readonly id: number,
    public readonly bondContractId: string,
    public readonly holderAccountId: string,
    public readonly partition: string,
    public readonly amount: string,
    public readonly operatorAccountId: string,
  ) {
    super()
  }
}
