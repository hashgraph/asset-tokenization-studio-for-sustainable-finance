// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class OfferingCreatedDLTEvent extends DLTEvent {
  readonly offeringDltId: string
  readonly operator: string
  readonly asset: string
  readonly treasury: string
  readonly paymentToken: string
  readonly lotSize: string
  readonly minQuantity: string
  readonly maxQuantity: string
  readonly targetQuantity: string
  readonly targetQuantityRule: number
  readonly startDate: string
  readonly endDate: string
  readonly deadlineRule: number

  constructor(
    contractId: string,
    transactionHash: string,
    offeringDltId: string,
    operator: string,
    asset: string,
    treasury: string,
    paymentToken: string,
    lotSize: string,
    minQuantity: string,
    maxQuantity: string,
    targetQuantity: string,
    targetQuantityRule: number,
    startDate: string,
    endDate: string,
    deadlineRule: number,
  ) {
    super(contractId, transactionHash)
    this.offeringDltId = offeringDltId
    this.operator = operator
    this.asset = asset
    this.treasury = treasury
    this.paymentToken = paymentToken
    this.lotSize = lotSize
    this.minQuantity = minQuantity
    this.maxQuantity = maxQuantity
    this.targetQuantity = targetQuantity
    this.targetQuantityRule = targetQuantityRule
    this.startDate = startDate
    this.endDate = endDate
    this.deadlineRule = deadlineRule
  }
}
