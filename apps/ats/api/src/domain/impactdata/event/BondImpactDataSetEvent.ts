// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondImpactDataSetEvent extends Event {
  constructor(
    public readonly bondContractId: string,
    public readonly operator: string,
    public readonly maxDeviationCap: string,
    public readonly baseLine: string,
    public readonly maxDeviationFloor: string,
    public readonly impactDataDecimals: string,
    public readonly adjustmentPrecision: string,
  ) {
    super()
  }
}
