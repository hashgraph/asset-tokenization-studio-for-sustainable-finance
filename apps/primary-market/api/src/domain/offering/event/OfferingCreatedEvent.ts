// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class OfferingCreatedEvent extends Event {
  constructor(
    public readonly offeringId: string,
    public readonly marketContractId: string,
    public readonly bondContractId: string,
    public readonly operatorId: string,
    public readonly treasuryContractId: string,
    public readonly paymentTokenContractId: string,
    public readonly lotSize: string,
    public readonly minQuantity: string,
    public readonly maxQuantity: string,
    public readonly targetQuantity: string,
    public readonly targetQuantityRule: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly deadlineRule: number,
  ) {
    super()
  }
}
