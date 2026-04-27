// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface Coupon {
  readonly recordDate: string
  readonly executionDate: string
  readonly startDate: string
  readonly endDate: string
  readonly fixingDate: string
  readonly rate: string
  readonly rateDecimals: string
  readonly rateStatus: string
}

export class CouponSetDLTEvent extends DLTEvent {
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly coupon: Coupon

  constructor(
    bondContractId: string,
    transactionHash: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    coupon: Coupon,
  ) {
    super(bondContractId, transactionHash)
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
    this.coupon = coupon
  }
}
