// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class OfferingCancelledEvent extends Event {
  constructor(
    public readonly offeringId: number,
    public readonly marketContractId: string,
    public readonly operatorAccountId: string,
    public readonly subscriptionIdsSuccess: number[],
    public readonly subscriptionIdsFailed: number[],
  ) {
    super()
  }
}
