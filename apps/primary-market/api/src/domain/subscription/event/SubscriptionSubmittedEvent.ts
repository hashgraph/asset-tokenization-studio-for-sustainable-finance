// SPDX-License-Identifier: Apache-2.0
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { Event } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionSubmittedEvent extends Event {
  constructor(
    public readonly offeringId: string,
    public readonly subscriptionId: string,
    public readonly status: SubscriptionStatus,
    public readonly investorId: string,
    public readonly lotUnits: string,
  ) {
    super()
  }
}
