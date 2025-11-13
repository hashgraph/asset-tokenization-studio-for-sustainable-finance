// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class OfferingCreatedEvent extends Event {
  constructor(
    public readonly offeringId: number,
    public readonly marketContractId: string,
    public readonly bondContractId: string,
    public readonly operatorAccountId: string,
    public readonly treasuryContractId: string,
    public readonly paymentTokenContractId: string,
    public readonly lotSize: string,
    public readonly minLots: string,
    public readonly maxLots: string,
    public readonly targetLots: string,
    public readonly targetQuantityRule: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly deadlineRule: number,
    public readonly price: string,
  ) {
    super()
  }
}
