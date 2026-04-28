// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface Offering {
  readonly asset: string
  readonly treasury: string
  readonly paymentToken: string
  readonly lotSize: string
  readonly minLots: string
  readonly maxLots: string
  readonly targetLots: string
  readonly targetQuantityRule: string
  readonly startDate: string
  readonly endDate: string
  readonly deadlineRule: string
  readonly price: string
  readonly priceDecimals: string
}

export class OfferingCreatedDLTEvent extends DLTEvent {
  readonly offeringId: string
  readonly operator: string
  readonly offering: Offering

  constructor(contractId: string, transactionHash: string, offeringId: string, operator: string, offering: Offering) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.operator = operator
    this.offering = offering
  }
}
