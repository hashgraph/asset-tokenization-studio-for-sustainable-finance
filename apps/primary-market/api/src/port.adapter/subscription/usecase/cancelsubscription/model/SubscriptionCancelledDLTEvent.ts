// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionCancelledDLTEvent extends DLTEvent {
  readonly offeringId: string
  readonly subscriptionId: string

  constructor(contractId: string, transactionHash: string, offeringId: string, subscriptionId: string) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
