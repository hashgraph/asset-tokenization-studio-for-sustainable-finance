// SPDX-License-Identifier: Apache-2.0
import { OfferingStatus } from "@domain/shared/model/OfferingStatus"
import { Event } from "@hashgraph/green-bonds-shared-core"

export class OfferingCreatedEvent extends Event {
  constructor(
    public readonly id: string,
    public readonly offeringId: string,
    public readonly marketId: string,
    public readonly bondId: string,
    public readonly status: OfferingStatus,
    public readonly treasuryId: string,
    public readonly paymentTokenId: string,
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
