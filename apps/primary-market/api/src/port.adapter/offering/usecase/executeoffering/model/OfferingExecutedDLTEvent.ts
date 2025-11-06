// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class OfferingExecutedDLTEvent extends DLTEvent {
  readonly offeringDltId: string
  readonly operator: string
  readonly subscriptionDltIdsSuccess: string[]
  readonly subscriptionDltIdsFailed: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    offeringDltId: string,
    operator: string,
    subscriptionDltIdsSuccess: string[],
    subscriptionDltIdsFailed: string[],
  ) {
    super(contractId, transactionHash)
    this.offeringDltId = offeringDltId
    this.operator = operator
    this.subscriptionDltIdsSuccess = subscriptionDltIdsSuccess
    this.subscriptionDltIdsFailed = subscriptionDltIdsFailed
  }
}
