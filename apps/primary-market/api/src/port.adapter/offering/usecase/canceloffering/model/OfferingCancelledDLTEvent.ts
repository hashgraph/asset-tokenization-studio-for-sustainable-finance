// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class OfferingCancelledDLTEvent extends DLTEvent {
  readonly offeringId: string
  readonly operator: string
  readonly subscriptionIdsSuccess: string[]
  readonly subscriptionIdsFailed: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    offeringId: string,
    operator: string,
    subscriptionIdsSuccess: string[],
    subscriptionIdsFailed: string[],
  ) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.operator = operator
    this.subscriptionIdsSuccess = subscriptionIdsSuccess
    this.subscriptionIdsFailed = subscriptionIdsFailed
  }
}
