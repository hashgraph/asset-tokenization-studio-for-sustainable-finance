// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class OfferingCreatedDLTEvent extends DLTEvent {
  readonly offeringId: string
  readonly operator: string
  readonly asset: string
  readonly treasury: string
  readonly paymentToken: string
  readonly price: string
  readonly priceDecimals: number
  readonly lotSize: string
  readonly minLots: string
  readonly maxLots: string
  readonly targetLots: string
  readonly targetQuantityRule: number
  readonly startDate: string
  readonly endDate: string
  readonly deadlineRule: number

  constructor(
    contractId: string,
    transactionHash: string,
    offeringId: string,
    operator: string,
    asset: string,
    treasury: string,
    paymentToken: string,
    price: string,
    priceDecimals: number,
    lotSize: string,
    minLots: string,
    maxLots: string,
    targetLots: string,
    targetQuantityRule: number,
    startDate: string,
    endDate: string,
    deadlineRule: number,
  ) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.operator = operator
    this.asset = asset
    this.treasury = treasury
    this.paymentToken = paymentToken
    this.price = price
    this.priceDecimals = priceDecimals
    this.lotSize = lotSize
    this.minLots = minLots
    this.maxLots = maxLots
    this.targetLots = targetLots
    this.targetQuantityRule = targetQuantityRule
    this.startDate = startDate
    this.endDate = endDate
    this.deadlineRule = deadlineRule
  }
}
