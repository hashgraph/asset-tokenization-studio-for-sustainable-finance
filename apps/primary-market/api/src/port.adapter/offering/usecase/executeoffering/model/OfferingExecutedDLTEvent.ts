// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class OfferingExecutedDLTEvent extends DLTEvent {
  readonly offeringDltId: string
  readonly operator: string
  readonly subscriptionIdsSuccess: string[]
  readonly subscriptionIdsFailed: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    offeringDltId: string,
    operator: string,
    subscriptionIdsSuccess: string[],
    subscriptionIdsFailed: string[],
  ) {
    super(contractId, transactionHash)
    this.offeringDltId = offeringDltId
    this.operator = operator
    this.subscriptionIdsSuccess = subscriptionIdsSuccess
    this.subscriptionIdsFailed = subscriptionIdsFailed
  }
}
