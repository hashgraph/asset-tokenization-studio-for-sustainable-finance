// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class SubscriptionSubmittedDLTEvent extends DLTEvent {
  readonly offeringDltId: string
  readonly subscriptionDltId: string
  readonly investor: string
  readonly lotUnits: string

  constructor(
    contractId: string,
    transactionHash: string,
    offeringDltId: string,
    subscriptionDltId: string,
    investor: string,
    lotUnits: string,
  ) {
    super(contractId, transactionHash)
    this.offeringDltId = offeringDltId
    this.subscriptionDltId = subscriptionDltId
    this.investor = investor
    this.lotUnits = lotUnits
  }
}
