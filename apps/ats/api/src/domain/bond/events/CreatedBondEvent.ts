// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class CreatedBondEvent extends Event {
  constructor(
    public readonly contractId: string,
    public readonly treasuryId: string,
    public readonly name: string,
    public readonly symbol: string,
    public readonly isin: string,
    public readonly decimals: number,
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly nominalValueDecimals: number,
    public readonly startingDate: Date,
    public readonly maturityDate: Date,
    public readonly maxSupply: string,
  ) {
    super()
  }
}
