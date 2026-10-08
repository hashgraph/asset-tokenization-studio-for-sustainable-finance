// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondKpiDataAddedEvent extends Event {
  constructor(
    public readonly bondContractId: string,
    public readonly project: string,
    public readonly date: string,
    public readonly value: string,
  ) {
    super()
  }
}
