// SPDX-License-Identifier: Apache-2.0
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { Event } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionSubmittedEvent extends Event {
  constructor(
    public readonly offeringId: number,
    public readonly marketContractId: string,
    public readonly subscriptionId: number,
    public readonly status: SubscriptionStatus,
    public readonly investorAccountId: string,
    public readonly lotUnits: string,
  ) {
    super()
  }
}
