// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class OfferingCancelledEvent extends Event {
  constructor(
    public readonly offeringDltId: string,
    public readonly marketContractId: string,
    public readonly operatorId: string,
    public readonly subscriptionDltIdsSuccess: string[],
    public readonly subscriptionDltIdsFailed: string[],
  ) {
    super()
  }
}
