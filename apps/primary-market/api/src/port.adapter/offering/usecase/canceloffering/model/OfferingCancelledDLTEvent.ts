// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class OfferingCancelledDLTEvent extends DLTEvent {
  readonly offeringId: number
  readonly operator: string
  readonly subscriptionIdsSuccess: number[]
  readonly subscriptionIdsFailed: number[]

  constructor(
    contractId: string,
    transactionHash: string,
    offeringId: number,
    operator: string,
    subscriptionIdsSuccess: number[],
    subscriptionIdsFailed: number[],
  ) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.operator = operator
    this.subscriptionIdsSuccess = subscriptionIdsSuccess
    this.subscriptionIdsFailed = subscriptionIdsFailed
  }
}
