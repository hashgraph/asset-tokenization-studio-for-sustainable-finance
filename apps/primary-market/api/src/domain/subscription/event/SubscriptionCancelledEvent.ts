// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionCancelledEvent extends Event {
  constructor(
    public readonly offeringDltId: string,
    public readonly subscriptionDltId: string,
  ) {
    super()
  }
}
