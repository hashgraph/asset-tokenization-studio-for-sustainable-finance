// SPDX-License-Identifier: Apache-2.0
export class SetBondCouponDomainServiceRequest {
  readonly contractId: string
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly recordDate: Date
  readonly executionDate: Date
  readonly rate: string
  readonly rateDecimals: string
  readonly period: string

  constructor(
    contractId: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: Date,
    executionDate: Date,
    rate: string,
    rateDecimals: string,
    period: string,
  ) {
    this.contractId = contractId
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
