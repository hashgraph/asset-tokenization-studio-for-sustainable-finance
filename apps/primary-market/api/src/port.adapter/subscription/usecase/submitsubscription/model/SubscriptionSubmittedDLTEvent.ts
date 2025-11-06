// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionSubmittedDLTEvent extends DLTEvent {
  readonly offeringId: string
  readonly subscriptionId: string
  readonly investor: string
  readonly lotUnits: string

  constructor(
    contractId: string,
    transactionHash: string,
    offeringId: string,
    subscriptionId: string,
    investor: string,
    lotUnits: string,
  ) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
    this.investor = investor
    this.lotUnits = lotUnits
  }
}
