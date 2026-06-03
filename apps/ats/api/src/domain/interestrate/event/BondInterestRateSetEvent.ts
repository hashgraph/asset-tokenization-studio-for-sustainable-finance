// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondInterestRateSetEvent extends Event {
  constructor(
    public readonly bondContractId: string,
    public readonly operator: string,
    public readonly maxRate: string,
    public readonly baseRate: string,
    public readonly minRate: string,
    public readonly startPeriod: string,
    public readonly startRate: string,
    public readonly missedPenalty: string,
    public readonly reportPeriod: string,
    public readonly rateDecimals: string,
  ) {
    super()
  }
}
