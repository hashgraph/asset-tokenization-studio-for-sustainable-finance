// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionCancelledDLTEvent extends DLTEvent {
  readonly offeringDltId: string
  readonly subscriptionDltId: string

  constructor(contractId: string, transactionHash: string, offeringDltId: string, subscriptionDltId: string) {
    super(contractId, transactionHash)
    this.offeringDltId = offeringDltId
    this.subscriptionDltId = subscriptionDltId
  }
}
