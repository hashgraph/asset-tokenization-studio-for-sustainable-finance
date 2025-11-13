// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionCancelledDLTEvent extends DLTEvent {
  readonly offeringId: number
  readonly subscriptionId: number

  constructor(contractId: string, transactionHash: string, offeringId: number, subscriptionId: number) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
