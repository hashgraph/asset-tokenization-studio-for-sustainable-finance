// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionSubmittedDLTEvent extends DLTEvent {
  readonly offeringId: number
  readonly subscriptionId: number
  readonly investor: string
  readonly lotUnits: string

  constructor(
    contractId: string,
    transactionHash: string,
    offeringId: number,
    subscriptionId: number,
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
