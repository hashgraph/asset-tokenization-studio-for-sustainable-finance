// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class CouponSetDLTEvent extends DLTEvent {
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly recordDate: string
  readonly executionDate: string
  readonly rate: string
  readonly rateDecimals: string
  readonly period: string

  constructor(
    bondContractId: string,
    transactionHash: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: string,
    executionDate: string,
    rate: string,
    rateDecimals: string,
    period: string,
  ) {
    super(bondContractId, transactionHash)
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.rate = rate
    this.rateDecimals = rateDecimals
    this.period = period
  }
}
