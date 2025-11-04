// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class OfferingExecutedEvent extends Event {
  constructor(
    public readonly offeringId: string,
    public readonly marketId: string,
    public readonly operatorId: string,
    public readonly subscriptionIdsSuccess: string[],
    public readonly subscriptionIdsFailed: string[],
  ) {
    super()
  }
}
